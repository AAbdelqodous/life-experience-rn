import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../../../components/ui/AppText';
import { useGetMyConversationsQuery } from '../../../../store/api/chatApi';

export default function ChatScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.dir() === 'rtl';

  const { data: conversationsData, isLoading, refetch } = useGetMyConversationsQuery({
    page: 0,
    size: 50,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const conversations = conversationsData?.content || [];

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return t('notification.yesterday');
    } else if (diffDays < 7) {
      return t('notification.daysAgo', { count: diffDays });
    } else {
      return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/(app)/(tabs)/chat/${item.id}`)}
    >
      <View style={[styles.avatar, isRTL && styles.avatarRtl]}>
        <Ionicons name="business" size={24} color="#2196F3" />
      </View>
      <View style={[styles.conversationContent, isRTL && styles.conversationContentRtl]}>
        <View style={styles.conversationHeader}>
          <AppText style={styles.centerName} numberOfLines={1}>
            {isRTL ? item.centerNameAr : item.centerNameEn}
          </AppText>
          <AppText style={styles.timestamp}>{formatTimestamp(item.lastMessageAt)}</AppText>
        </View>
        <View style={styles.conversationFooter}>
          <AppText style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || t('chat.startConversation')}
          </AppText>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <AppText style={styles.unreadCount}>{item.unreadCount}</AppText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#9E9E9E" />
      <AppText style={styles.emptyText}>{t('chat.noConversations')}</AppText>
      <AppText style={styles.emptySubtext}>{t('chat.noConversationsMessage')}</AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={conversations.length === 0 && styles.listContentEmpty}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarRtl: {
    marginRight: 0,
    marginLeft: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationContentRtl: {
    marginLeft: 0,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
