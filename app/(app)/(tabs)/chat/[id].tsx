import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MessageBubble from '../../../../components/chat/MessageBubble';
import { AppText } from '../../../../components/ui/AppText';
import { useWebSocketChat } from '../../../../hooks/useWebSocketChat';
import { Message, SenderType, useGetMessagesQuery, useSendMessageMutation } from '../../../../store/api/chatApi';

export default function ChatDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.dir() === 'rtl';
  const conversationId = Number(params.id);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  const centerNameAr = String(params.centerNameAr ?? '');
  const centerNameEn = String(params.centerNameEn ?? '');
  const centerName = isRTL ? centerNameAr : centerNameEn;

  const { isConnected, connectionError, sendMessage: sendWsMessage, subscribeToConversation } = useWebSocketChat();

  const { data: messagesData, isLoading: messagesLoading } = useGetMessagesQuery(
    { conversationId, params: { page: 0, size: 100, sortBy: 'date', sortOrder: 'asc' } }
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  // Initialize messages from API response
  useEffect(() => {
    if (messagesData?.content) {
      setMessages(messagesData.content);
    }
  }, [messagesData]);

  // Subscribe to conversation for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToConversation(conversationId, (newMessage) => {
      setMessages((prevMessages) => {
        // Check if message already exists to avoid duplicates
        const exists = prevMessages.some(m => m.id === newMessage.id);
        if (exists) {
          return prevMessages.map(m => m.id === newMessage.id ? newMessage : m);
        }
        return [...prevMessages, newMessage];
      });
      scrollToBottom();
    });

    return unsubscribe;
  }, [conversationId, subscribeToConversation]);

  // Show connection error alert
  useEffect(() => {
    if (connectionError) {
      Alert.alert(
        t('chat.connectionError') || 'Connection Error',
        t('chat.connectionErrorMessage') || 'Failed to connect to chat server. Messages may not update in real-time.',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  }, [connectionError, t]);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      // Try to send via WebSocket first
      if (isConnected) {
        sendWsMessage(conversationId, messageText.trim());
      } else {
        // Fallback to REST API if WebSocket is not connected
        await sendMessage({
          centerId: Number(params.centerId),
          content: messageText.trim(),
        }).unwrap();
      }
      setMessageText('');
      setSendError(null);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendError(t('chat.sendFailed') || 'Failed to send message. Please try again.');
      // Don't clear messageText so user can retry
    }
  };

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble
      key={item.id}
      message={item}
      isCurrentUser={item.senderType === SenderType.CUSTOMER}
    />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id.toString(), []);

  return (
    <>
      <Stack.Screen
        options={{
          title: centerName,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1A1A2E" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.connectionStatus}>
              <View style={[
                styles.connectionDot,
                isConnected ? styles.connected : styles.disconnected
              ]} />
            </View>
          ),
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1A1A2E',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          {messagesLoading && messages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
              onLayout={scrollToBottom}
              inverted={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={20}
            />
          )}
        </View>

        {sendError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#F44336" />
            <AppText style={styles.errorText}>{sendError}</AppText>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isRTL && styles.inputRtl]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={t('chat.typeMessage')}
            placeholderTextColor="#9E9E9E"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerButton: {
    marginLeft: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A2E',
    maxHeight: 100,
    marginRight: 12,
    textAlign: 'left',
  },
  inputRtl: {
    textAlign: 'right',
    marginRight: 0,
    marginLeft: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  connectionStatus: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    marginLeft: 8,
  },
});
