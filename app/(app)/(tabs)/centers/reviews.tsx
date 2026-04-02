import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ReviewCard from '../../../../components/listings/ReviewCard';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import RatingStars from '../../../../components/ui/RatingStars';
import { useCreateReviewMutation, useGetCenterReviewsQuery } from '../../../../store/api/reviewsApi';
import { useGetCenterByIdQuery } from '../../../../store/api/centersApi';

interface ReviewsFilter {
  rating?: number;
  sortBy?: 'recent' | 'highest' | 'lowest';
}

export default function CenterReviewsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isRTL = i18n.dir() === 'rtl';

  const centerId = Number(params.id);

  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<ReviewsFilter>({});
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const { data: center } = useGetCenterByIdQuery(centerId);
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isFetching,
  } = useGetCenterReviewsQuery({
    centerId,
    page,
    size: 20,
  });
  const [createReview, { isLoading: creatingReview }] = useCreateReviewMutation();

  const handleWriteReview = () => setShowWriteReview(true);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      return;
    }

    try {
      await createReview({
        centerId,
        rating: reviewRating,
        comment: reviewComment,
      }).unwrap();
      setShowWriteReview(false);
      setReviewRating(0);
      setReviewComment('');
    } catch {
      // Handle error
    }
  };

  const handleLoadMore = () => {
    if (reviewsData && !reviewsData.last && !isFetching) {
      setPage(page + 1);
    }
  };

  const handleFilterByRating = (rating: number | undefined) => {
    setFilter({ ...filter, rating });
    setPage(0);
  };

  const handleSortChange = (sortBy: 'recent' | 'highest' | 'lowest') => {
    setFilter({ ...filter, sortBy });
    setPage(0);
  };

  const calculateAverageRating = () => {
    if (!reviewsData || reviewsData.content.length === 0) return 0;
    const sum = reviewsData.content.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviewsData.content.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    if (!reviewsData) return [0, 0, 0, 0, 0];
    const distribution = [0, 0, 0, 0, 0];
    reviewsData.content.forEach((review) => {
      const ratingIndex = Math.min(review.rating - 1, 4);
      if (ratingIndex >= 0 && ratingIndex < 5) {
        distribution[ratingIndex]++;
      }
    });
    return distribution;
  };

  const centerName = center ? (isRTL ? center.nameAr : center.nameEn) : '';
  const ratingDistribution = getRatingDistribution();
  const totalReviews = ratingDistribution.reduce((a, b) => a + b, 0);

  const renderRatingBar = (star: number, count: number) => {
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return (
      <View key={star} style={styles.ratingBarRow}>
        <AppText style={styles.starLabel}>{star} ★</AppText>
        <View style={styles.ratingBarContainer}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <AppText style={styles.ratingBarCount}>{count}</AppText>
      </View>
    );
  };

  const renderReview = ({ item }: { item: any }) => (
    <ReviewCard
      rating={item.rating}
      comment={item.comment}
      userFirstname={item.userFirstname}
      userLastname={item.userLastname}
      date={item.createdAt}
    />
  );

  const renderFooter = () => {
    if (isFetching) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>
            {t('review.centerReviews', { center: centerName })}
          </AppText>
          <AppText style={styles.totalReviews}>
            {reviewsData?.totalElements || 0} {t('review.reviews')}
          </AppText>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.averageRatingContainer}>
            <AppText style={styles.averageRating}>{calculateAverageRating()}</AppText>
            <RatingStars rating={Number(calculateAverageRating())} />
            <AppText style={styles.totalReviewsSmall}>
              {reviewsData?.totalElements || 0} {t('review.reviews')}
            </AppText>
          </View>

          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map((star) =>
              renderRatingBar(star, ratingDistribution[star - 1])
            )}
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, !filter.rating && styles.filterChipActive]}
              onPress={() => handleFilterByRating(undefined)}
            >
              <AppText style={[styles.filterChipText, !filter.rating && styles.filterChipTextActive]}>
                {t('filter.all')}
              </AppText>
            </TouchableOpacity>
            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.filterChip, filter.rating === rating && styles.filterChipActive]}
                onPress={() => handleFilterByRating(rating)}
              >
                <AppText style={styles.filterChipIcon}>{rating} ★</AppText>
                <AppText
                  style={[styles.filterChipText, filter.rating === rating && styles.filterChipTextActive]}
                >
                  {ratingDistribution[rating - 1]}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sortContainer}>
          <AppText style={styles.sortLabel}>{t('filter.sortBy')}:</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { value: 'recent', label: t('filter.sortOptions.recent') },
              { value: 'highest', label: t('filter.sortOptions.highest') },
              { value: 'lowest', label: t('filter.sortOptions.lowest') },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortChip, filter.sortBy === option.value && styles.sortChipActive]}
                onPress={() => handleSortChange(option.value as any)}
              >
                <AppText style={[styles.sortChipText, filter.sortBy === option.value && styles.sortChipTextActive]}>
                  {option.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoadingReviews && page === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        ) : (
          <FlatList
            data={reviewsData?.content || []}
            renderItem={renderReview}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="star-outline" size={48} color="#9E9E9E" />
                <AppText style={styles.emptyText}>{t('review.noReviews')}</AppText>
                <AppText style={styles.emptySubtext}>{t('review.beFirstToReview')}</AppText>
              </View>
            }
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.writeReviewContainer}>
          <AppButton
            title={t('review.writeReview')}
            onPress={handleWriteReview}
            icon={<Ionicons name="create" size={20} color="#fff" />}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={showWriteReview} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>{t('review.writeReview')}</AppText>
              <TouchableOpacity onPress={() => setShowWriteReview(false)}>
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= reviewRating ? '#FFC107' : '#E0E0E0'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <AppText style={styles.modalInputTitle}>{t('review.yourReview')}</AppText>
            <View style={styles.modalInputContainer}>
              <AppText style={styles.modalInput}>{reviewComment || t('review.placeholder')}</AppText>
            </View>

            <AppButton
              title={creatingReview ? t('common.loading') : t('common.submit')}
              onPress={handleSubmitReview}
              disabled={reviewRating === 0 || creatingReview}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: '#757575',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginRight: 24,
  },
  averageRating: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  totalReviewsSmall: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  ratingDistribution: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starLabel: {
    fontSize: 12,
    color: '#757575',
    width: 24,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 4,
  },
  ratingBarCount: {
    fontSize: 12,
    color: '#757575',
    width: 20,
    textAlign: 'right',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 14,
    color: '#757575',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 12,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#2196F3',
  },
  sortChipText: {
    fontSize: 14,
    color: '#757575',
  },
  sortChipTextActive: {
    color: '#fff',
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
  listContent: {
    padding: 20,
    paddingBottom: 0,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  writeReviewContainer: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  modalInputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
  },
  modalInput: {
    fontSize: 14,
    color: '#1A1A2E',
    textAlignVertical: 'top',
  },
});
