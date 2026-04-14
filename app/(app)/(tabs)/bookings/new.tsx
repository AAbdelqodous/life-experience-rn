import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import {
    PaymentMethod,
    ServiceType,
} from '../../../../store/api/bookingsApi';
import { useGetCenterByIdQuery } from '../../../../store/api/centersApi';

export default function NewBookingScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { centerId } = useLocalSearchParams<{ centerId: string }>();
  const isRTL = i18n.dir() === 'rtl';

  const [step, setStep] = useState(0); // 0, 1, 2
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const { data: center, isLoading: centerLoading } = useGetCenterByIdQuery(
    Number(centerId),
    { skip: !centerId }
  );

  // Generate next 7 days
  const getUpcomingDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        label: date.toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        value: date.toISOString().split('T')[0], // YYYY-MM-DD
      });
    }
    return days;
  };

  // Time slots 9:00 to 18:00 every 30 min
  const getTimeSlots = () => {
    const slots = [];
    for (let h = 9; h <= 17; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    slots.push('18:00');
    return slots;
  };

  const serviceTypes = [
    { value: ServiceType.CAR, label: t('booking.serviceType.car'), icon: '🚗' },
    { value: ServiceType.ELECTRONICS, label: t('booking.serviceType.electronics'), icon: '📱' },
    { value: ServiceType.HOME_APPLIANCE, label: t('booking.serviceType.home_appliance'), icon: '🏠' },
    { value: ServiceType.EMERGENCY, label: t('booking.serviceType.emergency'), icon: '🚨' },
    { value: ServiceType.INSTALLATION, label: t('booking.serviceType.installation'), icon: '🔩' },
    { value: ServiceType.REPAIR, label: t('booking.serviceType.repair'), icon: '🔧' },
  ];

  const paymentMethods = [
    { value: PaymentMethod.CASH, label: t('booking.paymentMethod.cash'), icon: '💵' },
    { value: PaymentMethod.KNET, label: t('booking.paymentMethod.knet'), icon: '🏦' },
    { value: PaymentMethod.CREDIT_CARD, label: t('booking.paymentMethod.credit_card'), icon: '💳' },
  ];

  const handleNextStep = () => {
    if (step === 0 && !selectedServiceType) {
      Alert.alert(t('common.error'), t('booking.selectService'));
      return;
    }
    if (step === 1 && (!selectedDate || !selectedTime)) {
      Alert.alert(t('common.error'), t('booking.selectDate'));
      return;
    }
    setStep(step + 1);
  };

  const handleConfirm = () => {
    if (!selectedServiceType || !selectedDate || !selectedTime || !centerId) {
      Alert.alert(t('common.error'), t('common.retry'));
      return;
    }
    if (!customerPhone.trim()) {
      Alert.alert(t('common.error'), t('booking.phoneRequired'));
      return;
    }
    router.push({
      pathname: '/(app)/(tabs)/bookings/confirmation',
      params: {
        centerId: String(centerId),
        serviceType: selectedServiceType,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        paymentMethod: selectedPayment,
        customerPhone: customerPhone.trim(),
        serviceDescription: description || '',
        specialInstructions: notes || '',
      },
    });
  };

  const centerName = center ? (isRTL ? center.nameAr : center.nameEn) : '';

  // Progress indicator
  const renderProgress = () => (
    <View style={styles.progress}>
      {[0, 1, 2].map((s) => (
        <React.Fragment key={s}>
          <View style={[styles.progressStep, s <= step && styles.progressStepActive]}>
            <AppText style={[styles.progressStepText, s <= step && styles.progressStepTextActive]}>
              {s + 1}
            </AppText>
          </View>
          {s < 2 && (
            <View style={[styles.progressLine, s < step && styles.progressLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  if (!centerId) {
    return (
      <View style={styles.loading}>
        <AppText style={{ color: '#F44336', textAlign: 'center', margin: 20 }}>
          {t('booking.selectCenterFirst')}
        </AppText>
        <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)/centers')} style={{ alignItems: 'center' }}>
          <AppText style={{ color: '#2196F3', fontSize: 16 }}>{t('booking.browseCenters')}</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  if (centerLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{t('booking.title')}</AppText>
        <View style={{ width: 24 }} />
      </View>

      {renderProgress()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Center name */}
        {centerName ? (
          <AppText style={styles.centerName}>{centerName}</AppText>
        ) : null}

        {/* Step 0: Select Service Type */}
        {step === 0 && (
          <View>
            <AppText style={styles.stepTitle}>{t('booking.selectService')}</AppText>
            {serviceTypes.map((service) => (
              <TouchableOpacity
                key={service.value}
                style={[
                  styles.serviceCard,
                  selectedServiceType === service.value && styles.serviceCardSelected,
                ]}
                onPress={() => setSelectedServiceType(service.value)}
              >
                <AppText style={styles.serviceIcon}>{service.icon}</AppText>
                <AppText style={styles.serviceLabel}>{service.label}</AppText>
                {selectedServiceType === service.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>{t('booking.description')}</AppText>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder={t('booking.descriptionPlaceholder')}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <View>
            <AppText style={styles.stepTitle}>{t('booking.selectDate')}</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
              {getUpcomingDays().map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayCard, selectedDate === day.value && styles.dayCardSelected]}
                  onPress={() => setSelectedDate(day.value)}
                >
                  <AppText style={[styles.dayLabel, selectedDate === day.value && styles.dayLabelSelected]}>
                    {day.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <AppText style={[styles.stepTitle, { marginTop: 20 }]}>{t('booking.selectTime')}</AppText>
            <View style={styles.timeSlotsGrid}>
              {getTimeSlots().map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlot, selectedTime === time && styles.timeSlotSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <AppText style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextSelected]}>
                    {time}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <View>
            <AppText style={styles.stepTitle}>{t('booking.confirm')}</AppText>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <AppText style={styles.summaryLabel}>{t('booking.center')}</AppText>
                <AppText style={styles.summaryValue}>{centerName}</AppText>
              </View>
              <View style={styles.summaryRow}>
                <AppText style={styles.summaryLabel}>{t('booking.serviceTypeLabel')}</AppText>
                <AppText style={styles.summaryValue}>
                  {serviceTypes.find(s => s.value === selectedServiceType)?.label}
                </AppText>
              </View>
              <View style={styles.summaryRow}>
                <AppText style={styles.summaryLabel}>{t('booking.date')}</AppText>
                <AppText style={styles.summaryValue}>{selectedDate}</AppText>
              </View>
              <View style={styles.summaryRow}>
                <AppText style={styles.summaryLabel}>{t('booking.time')}</AppText>
                <AppText style={styles.summaryValue}>{selectedTime}</AppText>
              </View>
            </View>

            {/* Payment Method */}
            <AppText style={styles.stepTitle}>{t('booking.paymentMethodLabel')}</AppText>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.paymentCard,
                  selectedPayment === method.value && styles.paymentCardSelected,
                ]}
                onPress={() => setSelectedPayment(method.value)}
              >
                <AppText style={styles.serviceIcon}>{method.icon}</AppText>
                <AppText style={styles.serviceLabel}>{method.label}</AppText>
                {selectedPayment === method.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}

            {/* Phone */}
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>{t('booking.phone')} *</AppText>
              <TextInput
                style={styles.textInput}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="+965 XXXX XXXX"
                keyboardType="phone-pad"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>{t('booking.notes')}</AppText>
              <TextInput
                style={styles.textInput}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('booking.notesPlaceholder')}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomBar}>
        {step < 2 ? (
          <AppButton
            title={t('common.next')}
            onPress={handleNextStep}
            style={styles.nextButton}
          />
        ) : (
          <AppButton
            title={t('booking.confirm')}
            onPress={handleConfirm}
            style={styles.nextButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A2E' },
  progress: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  progressStep: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#E0E0E0',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  progressStepActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  progressStepText: { fontSize: 14, fontWeight: '600', color: '#9E9E9E' },
  progressStepTextActive: { color: '#fff' },
  progressLine: { width: 48, height: 2, backgroundColor: '#E0E0E0' },
  progressLineActive: { backgroundColor: '#2196F3' },
  content: { flex: 1, padding: 20 },
  centerName: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  stepTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A2E', marginBottom: 16 },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  serviceCardSelected: { borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
  serviceIcon: { fontSize: 28, marginRight: 16 },
  serviceLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1A1A2E' },
  inputGroup: { marginTop: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#1A1A2E', marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12,
    fontSize: 14, color: '#1A1A2E', textAlignVertical: 'top', backgroundColor: '#fff',
  },
  daysScroll: { marginBottom: 8 },
  dayCard: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#fff', marginRight: 12, borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', minWidth: 80,
  },
  dayCardSelected: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  dayLabel: { fontSize: 13, fontWeight: '500', color: '#1A1A2E', textAlign: 'center' },
  dayLabelSelected: { color: '#fff' },
  timeSlotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
  },
  timeSlotSelected: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  timeSlotText: { fontSize: 14, color: '#1A1A2E' },
  timeSlotTextSelected: { color: '#fff', fontWeight: '500' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: '#757575' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#1A1A2E', flex: 1, textAlign: 'right' },
  paymentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  paymentCardSelected: { borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
  bottomBar: {
    backgroundColor: '#fff', padding: 16,
    borderTopWidth: 1, borderTopColor: '#E0E0E0',
  },
  nextButton: { width: '100%' },
});
