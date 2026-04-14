import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { useCreateReviewMutation } from '../../../store/api/reviewsApi';

export default function NewReviewScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.dir() === 'rtl';

  const centerId = Number(params.centerId);
  const bookingId = params.bookingId ? Number(params.bookingId) : undefined;
  const centerNameAr = params.centerNameAr as string;
  const centerNameEn = params.centerNameEn as string;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleStarPress = (starValue: number) => {
    setRating(starValue);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(t('common.error'), t('review.ratingRequired'));
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert(t('common.error'), t('review.minCommentLength'));
      return;
    }

    try {
      await createReview({
        centerId,
        bookingId,
        rating,
        comment: comment.trim(),
      }).unwrap();
      Alert.alert(t('common.success'), t('review.success'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  };

  const centerName = isRTL ? centerNameAr : centerNameEn;

  return (
    <>
      <Stack.Screen
        options={{
          title: t('review.title'),
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
        <View style={styles.content}>
          <View style={styles.centerInfo}>
            <Ionicons name="business-outline" size={32} color="#2196F3" />
            <AppText style={styles.centerName}>{centerName}</AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('review.rating')}</AppText>
            <View style={[styles.starsContainer, isRTL && styles.starsContainerRtl]}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  activeOpacity={0.7}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#FFD700' : '#E0E0E0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <AppText style={styles.ratingText}>
                {rating} {t('review.stars')}
              </AppText>
            )}
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('review.comment')}</AppText>
            <View style={styles.commentContainer}>
              <View style={[styles.commentInput, isRTL && styles.commentInputRtl] as any}>
                <AppText style={styles.commentPlaceholder}>
                  {t('review.commentPlaceholder')}
                </AppText>
                <TextInput
                  style={[styles.commentText, isRTL && styles.commentTextRtl] as any}
                  value={comment}
                  onChangeText={setComment}
                  placeholder=""
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
              </View>
              <AppText style={styles.characterCount}>
                {comment.length}/500
              </AppText>
            </View>
          </View>

          <AppButton
            title={isLoading ? t('common.loading') : t('review.submit')}
            onPress={handleSubmit}
            disabled={isLoading || rating === 0 || comment.trim().length < 10}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  centerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginLeft: 12,
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
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starsContainerRtl: {
    flexDirection: 'row-reverse',
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 12,
  },
  commentContainer: {
    minHeight: 120,
  },
  commentInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  commentInputRtl: {
    textAlign: 'right',
  },
  commentPlaceholder: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 15,
    color: '#1A1A2E',
    minHeight: 80,
    textAlign: 'left',
  },
  commentTextRtl: {
    textAlign: 'right',
  },
  characterCount: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});
