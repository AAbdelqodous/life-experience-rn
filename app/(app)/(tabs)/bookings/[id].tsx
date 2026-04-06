import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { BookingStatus, PaymentMethod, ServiceType, useCancelBookingMutation, useGetBookingByIdQuery } from '../../../../store/api/bookingsApi';

export default function BookingDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.dir() === 'rtl';

  const bookingId = Number(params.id);
  const { data: booking, isLoading } = useGetBookingByIdQuery(bookingId);
  const [cancelBooking] = useCancelBookingMutation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      Alert.alert(t('common.error'), t('errors.required'));
      return;
    }

    try {
      await cancelBooking({ id: bookingId, data: { reason: cancelReason } }).unwrap();
      Alert.alert(t('common.success'), t('booking.cancel') + ' ' + t('common.success'));
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#FF9800';
      case BookingStatus.CONFIRMED:
        return '#2196F3';
      case BookingStatus.IN_PROGRESS:
        return '#9C27B0';
      case BookingStatus.COMPLETED:
        return '#4CAF50';
      case BookingStatus.CANCELLED:
        return '#757575';
      case BookingStatus.REJECTED:
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getServiceTypeLabel = (type: ServiceType) => {
    switch (type) {
      case ServiceType.CAR:
        return t('booking.serviceType.car');
      case ServiceType.ELECTRONICS:
        return t('booking.serviceType.electronics');
      case ServiceType.HOME_APPLIANCE:
        return t('booking.serviceType.homeAppliance');
      default:
        return type;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return t('booking.paymentMethod.cash');
      case PaymentMethod.KNET:
        return t('booking.paymentMethod.knet');
      case PaymentMethod.CREDIT_CARD:
        return t('booking.paymentMethod.credit_card');
      default:
        return method;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppText>{t('common.loading')}</AppText>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <AppText style={styles.errorText}>{t('common.error')}</AppText>
      </View>
    );
  }

  const centerName = booking.centerName;
  const canCancel = booking.bookingStatus === BookingStatus.PENDING || booking.bookingStatus === BookingStatus.CONFIRMED;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor(booking.bookingStatus) }]}>
        <AppText style={styles.statusText}>
          {t(`booking.status.${booking.bookingStatus.toLowerCase()}`)}
        </AppText>
      </View>

      {/* Booking Details */}
      <View style={styles.content}>
        {/* Center Info */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('booking.center')}</AppText>
          <TouchableOpacity
            style={styles.centerCard}
            onPress={() => router.push(`/(app)/(tabs)/centers/${booking.centerId}`)}
          >
            <View style={styles.centerInfo}>
              <Ionicons name="business-outline" size={24} color="#2196F3" />
              <View style={styles.centerDetails}>
                <AppText style={styles.centerName}>{centerName}</AppText>
                <AppText style={styles.centerLabel}>{t('booking.center')}</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {/* Service Info */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('booking.service')}</AppText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="build-outline" size={20} color="#2196F3" />
              <AppText style={styles.infoLabel}>{t('booking.serviceTypeLabel')}</AppText>
              <AppText style={styles.infoValue}>{getServiceTypeLabel(booking.serviceType)}</AppText>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#2196F3" />
              <AppText style={styles.infoLabel}>{t('booking.date')}</AppText>
              <AppText style={styles.infoValue}>{formatDate(booking.bookingDate)}</AppText>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#2196F3" />
              <AppText style={styles.infoLabel}>{t('booking.time')}</AppText>
              <AppText style={styles.infoValue}>{booking.bookingTime}</AppText>
            </View>
          </View>
        </View>

        {/* Description */}
        {booking.serviceDescription && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('booking.description')}</AppText>
            <View style={styles.descriptionCard}>
              <AppText style={styles.description}>{booking.serviceDescription}</AppText>
            </View>
          </View>
        )}

        {/* Notes */}
        {booking.specialInstructions && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('booking.notes')}</AppText>
            <View style={styles.notesCard}>
              <AppText style={styles.notes}>{booking.specialInstructions}</AppText>
            </View>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('booking.payment')}</AppText>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <AppText style={styles.paymentLabel}>{t('booking.paymentMethodLabel')}</AppText>
              <AppText style={styles.paymentValue}>{getPaymentMethodLabel(booking.paymentMethod)}</AppText>
            </View>
            {booking.estimatedCost && (
              <View style={styles.paymentRow}>
                <AppText style={styles.paymentLabel}>{t('booking.estimatedPrice')}</AppText>
                <AppText style={styles.price}>KD {booking.estimatedCost.toFixed(3)}</AppText>
              </View>
            )}
            {booking.finalCost && (
              <View style={styles.paymentRow}>
                <AppText style={styles.paymentLabel}>{t('booking.price')}</AppText>
                <AppText style={styles.price}>KD {booking.finalCost.toFixed(3)}</AppText>
              </View>
            )}
          </View>
        </View>

        {/* Cancellation Info */}
        {booking.cancelledReason && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('booking.cancelReason')}</AppText>
            <View style={styles.cancellationCard}>
              <AppText style={styles.cancellationReason}>{booking.cancelledReason}</AppText>
            </View>
          </View>
        )}

        {/* Booking Meta */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('booking.bookingDetails')}</AppText>
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <AppText style={styles.metaLabel}>{t('booking.id')}</AppText>
              <AppText style={styles.metaValue}>#{booking.id}</AppText>
            </View>
            <View style={styles.metaRow}>
              <AppText style={styles.metaLabel}>{t('booking.bookedOn')}</AppText>
              <AppText style={styles.metaValue}>{formatDate(booking.createdAt)}</AppText>
            </View>
            {booking.updatedAt !== booking.createdAt && (
              <View style={styles.metaRow}>
                <AppText style={styles.metaLabel}>{t('common.updated')}</AppText>
                <AppText style={styles.metaValue}>{formatDate(booking.updatedAt)}</AppText>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {canCancel && (
            <AppButton
              title={t('booking.cancel')}
              onPress={() => setShowCancelDialog(true)}
              variant="secondary"
              style={[styles.actionButton, styles.cancelButton] as any}
            />
          )}
          {(booking.bookingStatus === BookingStatus.COMPLETED || booking.bookingStatus === BookingStatus.CANCELLED) && (
            <AppButton
              title={t('complaint.fileComplaint')}
              onPress={() => {
                router.push({
                  pathname: '/(app)/complaints/new',
                  params: {
                    bookingId: String(booking.id),
                    centerId: String(booking.centerId),
                    centerName: booking.centerName,
                  },
                });
              }}
              variant="secondary"
              style={styles.actionButton as any}
            />
          )}
        </View>
      </View>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <AppText style={styles.dialogTitle}>{t('booking.cancel')}</AppText>
            <AppText style={styles.dialogMessage}>{t('booking.cancelReasonPlaceholder')}</AppText>
            <View style={styles.dialogInput}>
              <AppText style={styles.inputLabel}>{t('booking.cancelReason')}</AppText>
              <TextInput
                style={styles.textInput}
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder={t('booking.cancelReasonPlaceholder')}
                multiline
                numberOfLines={4}
              />
            </View>
            <View style={styles.dialogActions}>
              <AppButton
                title={t('common.cancel')}
                onPress={() => {
                  setShowCancelDialog(false);
                  setCancelReason('');
                }}
                variant="secondary"
                style={styles.dialogButton}
              />
              <AppButton
                title={t('common.confirm')}
                onPress={handleCancelBooking}
                style={styles.dialogButton}
              />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 12,
  },
  statusBanner: {
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  centerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerDetails: {
    marginLeft: 12,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  centerLabel: {
    fontSize: 12,
    color: '#757575',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: '#757575',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  notesCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  notes: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#757575',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  cancellationCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  cancellationReason: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  metaCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#757575',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#F44336',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  dialogInput: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A1A2E',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
  },
});
