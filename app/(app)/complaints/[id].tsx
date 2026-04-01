import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { ComplaintPriority, ComplaintStatus, useGetComplaintByIdQuery } from '../../../store/api/complaintsApi';

export default function ComplaintDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.dir() === 'rtl';
  const complaintId = Number(params.id);

  const { data: complaint, isLoading } = useGetComplaintByIdQuery(complaintId);

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.LOW:
        return '#9E9E9E';
      case ComplaintPriority.MEDIUM:
        return '#FF9800';
      case ComplaintPriority.HIGH:
        return '#F44336';
      case ComplaintPriority.URGENT:
        return '#D32F2F';
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

  const getPriorityText = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.LOW:
        return t('complaint.priority.low');
      case ComplaintPriority.MEDIUM:
        return t('complaint.priority.medium');
      case ComplaintPriority.HIGH:
        return t('complaint.priority.high');
      case ComplaintPriority.URGENT:
        return t('complaint.priority.urgent');
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <AppText style={styles.errorText}>{t('common.error')}</AppText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('complaint.complaintDetails'),
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Center Name */}
        <View style={styles.infoRow}>
          <Ionicons name="business" size={20} color="#757575" />
          <AppText style={styles.infoLabel}>{t('center.details')}</AppText>
          <AppText style={styles.infoValue}>
            {isRTL ? complaint.centerNameAr : complaint.centerNameEn}
          </AppText>
        </View>

        {/* Status Badge */}
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>{t('complaint.statusLabel')}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: getPriorityColor(complaint.priority) }]}>
            <AppText style={styles.statusText}>{getStatusText(complaint.status)}</AppText>
          </View>
        </View>

        {/* Priority Badge */}
        <View style={styles.infoRow}>
          <Ionicons name="flag" size={20} color="#757575" />
          <AppText style={styles.infoLabel}>{t('complaint.priorityLabel')}</AppText>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(complaint.priority) }]}>
            <AppText style={styles.priorityText}>{getPriorityText(complaint.priority)}</AppText>
          </View>
        </View>

        {/* Submitted Date */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color="#757575" />
          <AppText style={styles.infoLabel}>{t('complaint.submittedOn')}</AppText>
          <AppText style={styles.infoValue}>{formatDate(complaint.createdAt)}</AppText>
        </View>

        {/* Resolved Date */}
        {complaint.resolvedAt && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#757575" />
            <AppText style={styles.infoLabel}>{t('complaint.resolvedOn')}</AppText>
            <AppText style={styles.infoValue}>{formatDate(complaint.resolvedAt)}</AppText>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('complaint.description')}</AppText>
          <View style={styles.descriptionCard}>
            <AppText style={styles.descriptionText}>{complaint.description}</AppText>
          </View>
        </View>

        {/* Admin Response */}
        {complaint.adminResponse && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('complaint.response')}</AppText>
            <View style={styles.responseCard}>
              <AppText style={styles.responseText}>{complaint.adminResponse}</AppText>
            </View>
          </View>
        )}

        {!complaint.adminResponse && (
          <View style={styles.section}>
            <AppText style={styles.noResponseText}>{t('complaint.noResponse')}</AppText>
          </View>
        )}
      </ScrollView>
    </>
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
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 12,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
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
    color: '#1A1A2E',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  descriptionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  descriptionText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 20,
  },
  responseCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  responseText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 20,
  },
  noResponseText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
});
