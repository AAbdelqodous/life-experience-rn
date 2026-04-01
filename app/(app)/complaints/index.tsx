import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { Complaint, ComplaintStatus, ComplaintType, useGetMyComplaintsQuery } from '../../../store/api/complaintsApi';

export default function ComplaintsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.dir() === 'rtl';

  const { data: complaintsData, isLoading, refetch } = useGetMyComplaintsQuery({
    page: 0,
    size: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const complaints = complaintsData?.content || [];

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.SUBMITTED:
        return '#FF9800';
      case ComplaintStatus.UNDER_REVIEW:
        return '#2196F3';
      case ComplaintStatus.IN_PROGRESS:
        return '#9C27B0';
      case ComplaintStatus.RESOLVED:
        return '#4CAF50';
      case ComplaintStatus.REJECTED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.SUBMITTED:
        return t('complaint.status.submitted');
      case ComplaintStatus.UNDER_REVIEW:
        return t('complaint.status.under_review');
      case ComplaintStatus.IN_PROGRESS:
        return t('complaint.status.in_progress');
      case ComplaintStatus.RESOLVED:
        return t('complaint.status.resolved');
      case ComplaintStatus.REJECTED:
        return t('complaint.status.rejected');
      default:
        return '';
    }
  };

  const getTypeText = (type: ComplaintType) => {
    switch (type) {
      case ComplaintType.SERVICE_QUALITY:
        return t('complaint.types.service_quality');
      case ComplaintType.PRICING:
        return t('complaint.types.pricing');
      case ComplaintType.BEHAVIOR:
        return t('complaint.types.behavior');
      case ComplaintType.DELAY:
        return t('complaint.types.delay');
      case ComplaintType.DAMAGED_ITEM:
        return t('complaint.types.damaged_item');
      case ComplaintType.OTHER:
        return t('complaint.types.other');
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderComplaint = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.complaintItem}
      onPress={() => router.push(`/(app)/complaints/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.complaintHeader}>
        <AppText style={styles.centerName}>
          {isRTL ? item.centerNameAr : item.centerNameEn}
        </AppText>
        <View style={styles.statusBadge}>
          <AppText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </AppText>
        </View>
      </View>
      <View style={styles.complaintBody}>
        <AppText style={styles.typeLabel}>{getTypeText(item.type)}</AppText>
        <AppText style={styles.description} numberOfLines={2}>
          {item.description}
        </AppText>
        <AppText style={styles.date}>{formatDate(item.createdAt)}</AppText>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color="#9E9E9E" />
      <AppText style={styles.emptyText}>{t('complaint.noComplaints')}</AppText>
      <AppText style={styles.emptySubtext}>{t('complaint.noComplaintsMessage')}</AppText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={complaints}
        renderItem={renderComplaint}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, complaints.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
      />
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
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  complaintItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  complaintBody: {
    gap: 8,
  },
  typeLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
});
