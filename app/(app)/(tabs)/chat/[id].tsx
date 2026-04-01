import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MessageBubble from '../../../../components/chat/MessageBubble';
import { MessageType, SenderType, useGetConversationByIdQuery, useGetMessagesQuery, useSendMessageMutation } from '../../../../store/api/chatApi';

export default function ChatDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.dir() === 'rtl';
  const conversationId = Number(params.id);

  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<ScrollView>(null);

  const { data: conversation, isLoading: conversationLoading } = useGetConversationByIdQuery(conversationId);
  const { data: messagesData, isLoading: messagesLoading } = useGetMessagesQuery(
    { conversationId, params: { page: 0, size: 100, sortBy: 'date', sortOrder: 'asc' } },
    { pollingInterval: 5000 }
  );
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  const messages = messagesData?.content || [];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      await sendMessage({
        conversationId,
        content: messageText.trim(),
        type: MessageType.TEXT,
      }).unwrap();
      setMessageText('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (conversationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const centerName = conversation ? (isRTL ? conversation.centerNameAr : conversation.centerNameEn) : '';

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
          {messagesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          ) : (
            <ScrollView
              ref={flatListRef}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
            >
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={message.senderType === SenderType.USER}
                />
              ))}
            </ScrollView>
          )}
        </View>

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
});
