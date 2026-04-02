import NotificationItem from '@/components/listings/NotificationItem';
import { AppText } from '@/components/ui/AppText';
import FilterModal from '@/components/ui/FilterModal';
import { useAppDispatch, useAppSelector } from '@/store';
import { useDeleteNotificationMutation, useGetMyNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } from '@/store/api/notificationsApi';
import { clearNotificationsFilters, markAllAsRead, setNotificationsFilters } from '@/store/notificationsSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isRTL = i18n.dir() === 'rtl';

  const filters = useAppSelector((state) => state.notifications.filters);
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);

  const { data: notificationsData, isLoading, refetch } = useGetMyNotificationsQuery({
    page: 0,
    size: 20,
    isRead: filters.isRead,
    type: filters.type,
    priority: filters.priority,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const [markAllAsReadApi] = useMarkAllAsReadMutation();
  const [markAsReadApi] = useMarkAsReadMutation();
  const [deleteNotificationApi] = useDeleteNotificationMutation();

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    dispatch(setNotificationsFilters(newFilters));
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    dispatch(clearNotificationsFilters());
    setFilterModalVisible(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadApi().unwrap();
      dispatch(markAllAsRead());
      refetch();
    } catch (error) {
      // Silently ignore mark-as-read errors
    }
  };

  const handleNotificationPress = useCallback(async (notification: any) => {
    if (!notification.isRead) {
      try {
        await markAsReadApi(notification.id).unwrap();
        refetch();
      } catch {
        // Silently ignore
      }
    }
    if (notification.actionUrl && (notification.actionUrl.startsWith('/(app)/') || notification.actionUrl.startsWith('/'))) {
      router.push(notification.actionUrl as any);
    }
  }, [markAsReadApi, refetch, router]);

  const handleDeleteNotification = async (notificationId: number) => {
    Alert.alert(
      t('common.delete'),
      t('notification.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotificationApi(notificationId).unwrap();
              refetch();
            } catch (error) {
              Alert.alert(t('common.error'), t('common.retry'));
            }
          },
        },
      ]
    );
  };

  const renderNotification = ({ item }: { item: any }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={48} color="#9E9E9E" />
      <AppText style={styles.emptyText}>{t('notification.noNotifications')}</AppText>
      <AppText style={styles.emptySubtext}>{t('notification.noNotificationsMessage')}</AppText>
    </View>
  );

  const unreadCount = notificationsData?.content?.filter((n) => !n.isRead).length || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>{t('notification.title')}</AppText>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <AppText style={styles.headerButtonText}>
                {t('notification.markAllRead')}
              </AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options-outline" size={24} color="#1A1A2E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notificationsData?.content || []}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          notificationsData?.content?.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        filters={{
          categories: [
            { label: t('notification.types.booking_confirmed'), value: 'BOOKING_CONFIRMED' },
            { label: t('notification.types.booking_cancelled'), value: 'BOOKING_CANCELLED' },
            { label: t('notification.types.booking_reminder'), value: 'BOOKING_REMINDER' },
            { label: t('notification.types.booking_completed'), value: 'BOOKING_COMPLETED' },
            { label: t('notification.types.review_request'), value: 'REVIEW_REQUEST' },
            { label: t('notification.types.promotion'), value: 'PROMOTION' },
            { label: t('notification.types.system'), value: 'SYSTEM' },
          ],
          ratingOptions: [
            { label: t('notification.priority.urgent'), value: 'URGENT' },
            { label: t('notification.priority.high'), value: 'HIGH' },
            { label: t('notification.priority.medium'), value: 'MEDIUM' },
            { label: t('notification.priority.low'), value: 'LOW' },
          ],
          sortOptions: [
            { label: t('common.date'), value: 'date' },
            { label: t('notification.priority.title'), value: 'priority' },
          ],
        }}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  listContent: {
    padding: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#1A1A2E',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
});
