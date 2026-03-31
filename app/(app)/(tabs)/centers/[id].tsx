import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import ReviewCard from '../../../../components/listings/ReviewCard';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import RatingStars from '../../../../components/ui/RatingStars';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { useGetCenterByIdQuery } from '../../../../store/api/centersApi';
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from '../../../../store/api/favoritesApi';
import { useCreateReviewMutation, useGetReviewsQuery } from '../../../../store/api/reviewsApi';
import { addToFavorites, removeFromFavorites, selectIsFavorite } from '../../../../store/favoritesSlice';

export default function CenterDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const isRTL = i18n.dir() === 'rtl';

  const centerId = Number(params.id);

  const { data: center, isLoading: centerLoading } = useGetCenterByIdQuery(centerId);
  const { data: reviewsData } = useGetReviewsQuery({
    centerId,
    page: 0,
    size: 5,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const isFavorite = useAppSelector((state) => selectIsFavorite(state, centerId));
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const [selectedTab, setSelectedTab] = useState<'about' | 'reviews'>('about');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation();

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(centerId).unwrap();
        dispatch(removeFromFavorites(centerId));
      } else {
        await addFavorite(centerId).unwrap();
        dispatch(addToFavorites(centerId));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  };

  const handleCall = () => {
    if (center?.phone) {
      // Handle phone call
      Alert.alert(t('center.call'), center.phone);
    }
  };

  const handleDirections = () => {
    if (center?.latitude && center?.longitude) {
      // Handle directions
      Alert.alert(t('center.directions'), `${center.latitude}, ${center.longitude}`);
    }
  };

  const handleShare = () => {
    // Handle share
    Alert.alert(t('center.share'), 'Share functionality');
  };

  const handleBookNow = () => {
    router.push({
      pathname: '/(app)/(tabs)/bookings/new',
      params: { centerId: String(centerId) },
    });
  };

  const handleWriteReview = () => setShowReviewModal(true);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      Alert.alert(t('common.error'), t('review.rating'));
      return;
    }
    try {
      await createReview({ centerId, rating: reviewRating, comment: reviewComment }).unwrap();
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment('');
      Alert.alert(t('common.ok'), t('review.success'));
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  };

  if (centerLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppText>{t('common.loading')}</AppText>
      </View>
    );
  }

  if (!center) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <AppText style={styles.errorText}>{t('common.error')}</AppText>
      </View>
    );
  }

  const name = isRTL ? center.nameAr : center.nameEn;
  const description = isRTL ? center.descriptionAr : center.descriptionEn;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        {center.imageUrl ? (
          <Image source={{ uri: center.imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <AppText style={styles.heroPlaceholderText}>{name.charAt(0)}</AppText>
          </View>
        )}
        <View style={styles.heroOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroAction} onPress={handleFavoriteToggle}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#E91E63' : '#fff'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroAction} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Center Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <AppText style={styles.name}>{name}</AppText>
            <View style={styles.ratingRow}>
              <RatingStars rating={center.averageRating} size={16} showCount reviewCount={center.reviewCount} />
            </View>
          </View>
          {center.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
              <AppText style={styles.verifiedText}>{t('center.verified')}</AppText>
            </View>
          )}
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: center.isOpen ? '#4CAF50' : '#F44336' },
            ]}
          />
          <AppText
            style={[
              styles.statusText,
              { color: center.isOpen ? '#4CAF50' : '#F44336' },
            ]}
          >
            {center.isOpen ? t('center.open') : t('center.closed')}
          </AppText>
          {center.openingHours && (
            <AppText style={styles.openingHours}>{center.openingHours}</AppText>
          )}
        </View>

        {/* Description */}
        {description && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('center.about')}</AppText>
            <AppText style={styles.description}>{description}</AppText>
          </View>
        )}

        {/* Categories */}
        {center.categories && center.categories.length > 0 && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>{t('center.services')}</AppText>
            <View style={styles.categoriesContainer}>
              {center.categories.map((category) => (
                <View key={category.id} style={styles.categoryBadge}>
                  <AppText style={styles.categoryText}>
                    {isRTL ? category.nameAr : category.nameEn}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('center.contact')}</AppText>
          {center.phone && (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#2196F3" />
              <AppText style={styles.contactText}>{center.phone}</AppText>
            </TouchableOpacity>
          )}
          {center.email && (
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color="#2196F3" />
              <AppText style={styles.contactText}>{center.email}</AppText>
            </View>
          )}
          {center.website && (
            <View style={styles.contactRow}>
              <Ionicons name="globe-outline" size={20} color="#2196F3" />
              <AppText style={styles.contactText}>{center.website}</AppText>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('center.location')}</AppText>
          <AppText style={styles.address}>
            {center.address.street}, {center.address.area}, {center.address.city}
          </AppText>
          <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
            <Ionicons name="navigate-outline" size={20} color="#2196F3" />
            <AppText style={styles.directionsText}>{t('center.directions')}</AppText>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'about' && styles.activeTab]}
            onPress={() => setSelectedTab('about')}
          >
            <AppText
              style={[styles.tabText, selectedTab === 'about' && styles.activeTabText]}
            >
              {t('center.about')}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]}
            onPress={() => setSelectedTab('reviews')}
          >
            <AppText
              style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}
            >
              {t('center.reviews')}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        {selectedTab === 'reviews' && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <AppText style={styles.reviewsTitle}>
                {t('center.reviews')} ({center.reviewCount})
              </AppText>
              <TouchableOpacity onPress={handleWriteReview}>
                <AppText style={styles.writeReview}>{t('center.writeReview')}</AppText>
              </TouchableOpacity>
            </View>
            {reviewsData?.content && reviewsData.content.length > 0 ? (
              <>
                {reviewsData.content.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </>
            ) : (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="star-outline" size={48} color="#9E9E9E" />
                <AppText style={styles.noReviewsText}>{t('center.noReviews')}</AppText>
                <AppText style={styles.beFirstToReview}>{t('center.beFirstToReview')}</AppText>
                <AppButton
                  title={t('center.writeReview')}
                  onPress={handleWriteReview}
                  style={styles.writeReviewButton}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <AppButton
          title={t('center.bookNow')}
          onPress={handleBookNow}
          style={styles.bookButton}
        />
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <AppText style={styles.modalTitle}>{t('review.title')}</AppText>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <AppText style={[styles.starIcon, { color: star <= reviewRating ? '#FFD700' : '#E0E0E0' }]}>
                    ★
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder={t('review.commentPlaceholder')}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <AppButton
                title={t('common.cancel')}
                variant="secondary"
                onPress={() => setShowReviewModal(false)}
                style={styles.modalButton}
              />
              <AppButton
                title={submittingReview ? t('common.loading') : t('review.submit')}
                onPress={handleSubmitReview}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  heroContainer: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#757575',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  openingHours: {
    fontSize: 12,
    color: '#757575',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 13,
    color: '#424242',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#424242',
  },
  address: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  directionsText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 15,
    color: '#757575',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
  },
  reviewsSection: {
    marginTop: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  writeReview: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#1A1A2E',
    marginTop: 12,
    fontWeight: '500',
  },
  beFirstToReview: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    marginBottom: 20,
  },
  writeReviewButton: {
    width: '100%',
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bookButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  starIcon: {
    fontSize: 36,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
