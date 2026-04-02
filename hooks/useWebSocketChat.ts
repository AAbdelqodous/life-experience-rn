import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { WS_BASE_URL } from '../lib/constants/config';
import { RootState } from '../store';
import { Message } from '../store/api/chatApi';

interface WebSocketChatHookReturn {
  isConnected: boolean;
  connectionError: string | null;
  sendMessage: (conversationId: number, content: string) => void;
  subscribeToConversation: (
    conversationId: number,
    onMessage: (message: Message) => void
  ) => () => void;
  unsubscribeFromConversation: (conversationId: number) => void;
}

interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Custom hook for managing WebSocket connections with STOMP protocol
 * for real-time chat functionality.
 */
export function useWebSocketChat(): WebSocketChatHookReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriptionsRef = useRef<Map<number, Set<(message: Message) => void>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const token = useSelector((state: RootState) => state.auth.session?.token);

  // Parse STOMP frame from raw message
  const parseStompFrame = useCallback((data: string): StompFrame | null => {
    try {
      const lines = data.split('\n');
      const command = lines[0];
      const headers: Record<string, string> = {};
      let bodyStartIndex = -1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') {
          bodyStartIndex = i + 1;
          break;
        }
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          headers[key] = value;
        }
      }

      const body = bodyStartIndex > 0 ? lines.slice(bodyStartIndex).join('\n') : undefined;

      return { command, headers, body };
    } catch (error) {
      console.error('Failed to parse STOMP frame:', error);
      return null;
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    const frame = parseStompFrame(event.data);
    if (!frame) return;

    // Handle MESSAGE frames
    if (frame.command === 'MESSAGE') {
      try {
        const message: Message = JSON.parse(frame.body || '{}');
        const destination = frame.headers['destination'];

        // Extract conversation ID from destination
        // Format: /topic/conversations/{conversationId}
        const match = destination?.match(/\/topic\/conversations\/(\d+)/);
        if (match) {
          const conversationId = parseInt(match[1], 10);
          const callbacks = subscriptionsRef.current.get(conversationId);
          if (callbacks) {
            callbacks.forEach(callback => callback(message));
          }
        }
      } catch (error) {
        console.error('Failed to parse message body:', error);
      }
    }
  }, [parseStompFrame]);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws`;
      console.log('Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);

        // Send STOMP CONNECT frame
        const connectFrame = `CONNECT\nAuthorization: Bearer ${token}\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n\n\0`;
        ws.send(connectFrame);

        // Start heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('\n'); // Heartbeat
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        const frame = parseStompFrame(event.data);
        if (frame) {
          // Handle CONNECTED frame
          if (frame.command === 'CONNECTED') {
            console.log('STOMP connection established');
            setIsConnected(true);
          } else {
            handleMessage(event);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt to reconnect after 5 seconds
        if (event.code !== 1000) { // Not a normal close
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect to chat server');
    }
  }, [token, parseStompFrame, handleMessage]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send('DISCONNECT\n\n\0');
      }
      wsRef.current.close(1000, 'Normal closure');
      wsRef.current = null;
    }

    setIsConnected(false);
    subscriptionsRef.current.clear();
  }, []);

  // Send a message through WebSocket
  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const messageBody = JSON.stringify({ conversationId, content });
    const sendFrame = `SEND\ndestination:/app/chat.send\ncontent-length:${messageBody.length}\n\n${messageBody}\0`;
    wsRef.current.send(sendFrame);
  }, []);

  // Subscribe to a conversation
  const subscribeToConversation = useCallback((
    conversationId: number,
    onMessage: (message: Message) => void
  ) => {
    if (!subscriptionsRef.current.has(conversationId)) {
      subscriptionsRef.current.set(conversationId, new Set());
    }
    subscriptionsRef.current.get(conversationId)!.add(onMessage);

    // Send SUBSCRIBE frame
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const subscribeFrame = `SUBSCRIBE\ndestination:/topic/conversations/${conversationId}\nid:sub-${conversationId}\n\n\0`;
      wsRef.current.send(subscribeFrame);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = subscriptionsRef.current.get(conversationId);
      if (callbacks) {
        callbacks.delete(onMessage);
        if (callbacks.size === 0) {
          subscriptionsRef.current.delete(conversationId);
          // Send UNSUBSCRIBE frame
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const unsubscribeFrame = `UNSUBSCRIBE\nid:sub-${conversationId}\n\n\0`;
            wsRef.current.send(unsubscribeFrame);
          }
        }
      }
    };
  }, []);

  // Unsubscribe from a conversation
  const unsubscribeFromConversation = useCallback((conversationId: number) => {
    subscriptionsRef.current.delete(conversationId);
    // Send UNSUBSCRIBE frame
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const unsubscribeFrame = `UNSUBSCRIBE\nid:sub-${conversationId}\n\n\0`;
      wsRef.current.send(unsubscribeFrame);
    }
  }, []);

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    subscribeToConversation,
    unsubscribeFromConversation,
  };
}
