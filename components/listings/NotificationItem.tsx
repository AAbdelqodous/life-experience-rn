import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Notification, NotificationPriority, NotificationType } from '../../store/api/notificationsApi';
import { AppText } from '../ui/AppText';

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.dir() === 'rtl';

  const title = isRTL ? notification.titleAr : notification.titleEn;
  const body = isRTL ? notification.bodyAr : notification.bodyEn;

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return '#F44336';
      case NotificationPriority.HIGH:
        return '#FF9800';
      case NotificationPriority.NORMAL:
        return '#2196F3';
      case NotificationPriority.LOW:
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.BOOKING_CONFIRMED:
        return '✓';
      case NotificationType.BOOKING_CANCELLED:
        return '✕';
      case NotificationType.BOOKING_REMINDER:
        return '🔔';
      case NotificationType.BOOKING_COMPLETED:
        return '★';
      case NotificationType.REVIEW_REQUEST:
        return '✎';
      case NotificationType.PROMOTION:
        return '🎁';
      case NotificationType.SYSTEM:
        return 'ℹ';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notification.justNow');
    if (diffMins < 60) return t('notification.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('notification.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('notification.daysAgo', { count: diffDays });
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePress = () => {
    onPress?.(notification);
    if (notification.actionUrl && typeof notification.actionUrl === 'string' && (notification.actionUrl.startsWith('/(app)/') || notification.actionUrl.startsWith('/'))) {
      // Handle action URL navigation - only allow relative paths starting with / or app paths
      router.push(notification.actionUrl as any);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unread,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <AppText style={styles.icon}>{getTypeIcon(notification.notificationType)}</AppText>
        <View
          style={[
            styles.priorityDot,
            { backgroundColor: getPriorityColor(notification.notificationPriority) },
          ]}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <AppText style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          <AppText style={styles.time}>{formatDate(notification.createdAt)}</AppText>
        </View>
        <AppText style={styles.body} numberOfLines={2}>
          {body}
        </AppText>
      </View>

      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unread: {
    backgroundColor: '#E3F2FD',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  icon: {
    fontSize: 24,
  },
  priorityDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#757575',
  },
  body: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginTop: 6,
  },
});
