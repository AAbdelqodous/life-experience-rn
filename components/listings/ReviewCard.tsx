import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Review } from '../../store/api/reviewsApi';
import { AppText } from '../ui/AppText';
import RatingStars from '../ui/RatingStars';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>
              {review.userName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.userDetails}>
            <AppText style={styles.userName}>{review.userName}</AppText>
            <AppText style={styles.date}>{formatDate(review.createdAt)}</AppText>
          </View>
        </View>
        <RatingStars rating={review.rating} size={14} />
      </View>

      {review.comment && (
        <AppText style={styles.comment}>{review.comment}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  comment: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});
