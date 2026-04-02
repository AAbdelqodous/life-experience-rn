import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Message, SenderType } from '../../store/api/chatApi';
import { AppText } from '../ui/AppText';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUser : styles.otherUser,
        isRTL && styles.rtl,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        {message.senderType === SenderType.CENTER_STAFF && !isCurrentUser && (
          <AppText style={styles.senderName}>{message.senderName}</AppText>
        )}
        <AppText style={styles.content}>{message.content}</AppText>
        <View style={styles.footer}>
          <AppText style={[styles.time, !isCurrentUser && styles.timeOther]}>{formatTime(message.createdAt)}</AppText>
          {isCurrentUser && (
            <AppText style={[styles.readStatus, message.read && styles.read]}>
              {message.read ? '✓✓' : '✓'}
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  currentUser: {
    justifyContent: 'flex-end',
  },
  otherUser: {
    justifyContent: 'flex-start',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    color: '#212121',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  timeOther: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.6)',
    marginRight: 4,
  },
  readStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  read: {
    color: '#4CAF50',
  },
});
