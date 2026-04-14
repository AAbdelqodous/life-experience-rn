import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import { ComplaintType, useCreateComplaintMutation } from '../../../store/api/complaintsApi';

export default function NewComplaintScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.dir() === 'rtl';

  const centerId = params.centerId ? Number(params.centerId) : undefined;
  const bookingId = params.bookingId ? Number(params.bookingId) : undefined;
  const centerNameAr = params.centerNameAr as string | undefined;
  const centerNameEn = params.centerNameEn as string | undefined;

  const [complaintType, setComplaintType] = useState<ComplaintType | ''>(ComplaintType.OTHER);
  const [description, setDescription] = useState('');

  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  const complaintTypes = [
    { value: ComplaintType.SERVICE_QUALITY, label: t('complaint.types.service_quality') },
    { value: ComplaintType.PRICING, label: t('complaint.types.pricing') },
    { value: ComplaintType.BEHAVIOR, label: t('complaint.types.behavior') },
    { value: ComplaintType.DELAY, label: t('complaint.types.delay') },
    { value: ComplaintType.DAMAGED_ITEM, label: t('complaint.types.damaged_item') },
    { value: ComplaintType.OTHER, label: t('complaint.types.other') },
  ];

  const handleSubmit = async () => {
    if (!complaintType) {
      Alert.alert(t('common.error'), t('errors.required'));
      return;
    }

    if (!description.trim()) {
      Alert.alert(t('common.error'), t('errors.required'));
      return;
    }

    if (!centerId) {
      Alert.alert(t('common.error'), t('complaint.centerRequired'));
      return;
    }

    try {
      await createComplaint({
        centerId,
        bookingId,
        type: complaintType,
        description: description.trim(),
      }).unwrap();
      Alert.alert(t('complaint.success'), '', [
        { text: t('common.ok'), onPress: () => router.replace('/(app)/complaints') },
      ]);
    } catch {
      Alert.alert(t('common.error'), t('complaint.submitError'));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('complaint.title'),
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
        {!centerId && (
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={24} color="#FF9800" />
            <AppText style={styles.noticeText}>
              {t('complaint.centerRequired')}
            </AppText>
          </View>
        )}

        {centerNameAr && centerNameEn && (
          <View style={styles.centerNameRow}>
            <AppText style={styles.centerNameLabel}>{t('complaint.filingAgainst')}</AppText>
            <AppText style={styles.centerNameValue}>
              {isRTL ? centerNameAr : centerNameEn}
            </AppText>
          </View>
        )}

        {bookingId && (
          <View style={styles.bookingRow}>
            <AppText style={styles.bookingLabel}>{t('complaint.linkedBooking')}</AppText>
            <AppText style={styles.bookingValue}>#{bookingId}</AppText>
          </View>
        )}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('complaint.type')}</AppText>
          <View style={styles.typeChips}>
            {complaintTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeChip,
                  complaintType === type.value && styles.typeChipSelected,
                ]}
                onPress={() => setComplaintType(type.value)}
                activeOpacity={0.7}
              >
                <AppText
                  style={[
                    styles.typeChipText,
                    complaintType === type.value && styles.typeChipTextSelected,
                  ]}
                >
                  {type.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('complaint.description')}</AppText>
          <TextInput
            style={[styles.descriptionInput, isRTL && styles.descriptionInputRtl]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('complaint.descriptionPlaceholder')}
            placeholderTextColor="#9E9E9E"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !complaintType && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || !complaintType || !description.trim()}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <View style={styles.submitButtonContent}>
              <Ionicons name="send" size={20} color="#fff" />
              <AppText style={styles.submitButtonText}>{t('complaint.submit')}</AppText>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    flex: 1,
  },
  centerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  centerNameLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  centerNameValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bookingLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  bookingValue: {
    fontSize: 15,
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
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  typeChipSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  typeChipText: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  typeChipTextSelected: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A2E',
    textAlign: 'left',
  },
  descriptionInputRtl: {
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
