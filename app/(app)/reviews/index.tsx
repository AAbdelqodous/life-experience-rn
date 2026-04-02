import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AppText } from '../../../components/ui/AppText';
import RatingStars from '../../../components/ui/RatingStars';
import { Review, useDeleteReviewMutation, useGetMyReviewsQuery, useUpdateReviewMutation } from '../../../store/api/reviewsApi';

export default function MyReviewsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.dir() === 'rtl';

  const { data: reviewsData, isLoading, refetch } = useGetMyReviewsQuery({ page: 0, size: 50 });
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const reviews = reviewsData?.content || [];

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;

    try {
      await updateReview({
        id: editingId,
        data: {
          centerId: reviews.find((r: Review) => r.id === editingId)?.centerId || 0,
          rating: editRating,
          comment: editComment,
        },
      }).unwrap();
      setEditingId(null);
      setEditRating(0);
      setEditComment('');
      refetch();
      Alert.alert(t('review.updateSuccess'));
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleDelete = (reviewId: number) => {
    Alert.alert(
      t('review.deleteConfirm'),
      '',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId).unwrap();
              refetch();
              Alert.alert(t('review.deleteSuccess'));
            } catch (error) {
              console.error('Failed to delete review:', error);
            }
          },
        },
      ],
    );
  };

  const renderReview = ({ item }: { item: Review }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.centerInfo}>
            <AppText style={styles.centerName}>
              {isRTL ? item.centerNameAr : item.centerNameEn}
            </AppText>
            <RatingStars rating={item.rating} size={14} />
          </View>
          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="pencil" size={18} color="#757575" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setEditRating(star)}
                >
                  <Ionicons
                    name={star <= editRating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= editRating ? '#FFC107' : '#9E9E9E'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.editInput}
              value={editComment}
              onChangeText={setEditComment}
              placeholder={t('review.writeYourFirstReview')}
              placeholderTextColor="#9E9E9E"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!editRating || !editComment.trim()) && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveEdit}
              disabled={!editRating || !editComment.trim() || updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AppText style={styles.saveButtonText}>{t('review.saveChanges')}</AppText>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditingId(null);
                setEditRating(0);
                setEditComment('');
              }}
            >
              <AppText style={styles.cancelButtonText}>{t('common.cancel')}</AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {item.comment && (
              <AppText style={styles.comment}>{item.comment}</AppText>
            )}
            <AppText style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString(
                i18n.language === 'ar' ? 'ar-KW' : 'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }
              )}
            </AppText>
          </>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color="#9E9E9E" />
      <AppText style={styles.emptyTitle}>{t('review.noReviews')}</AppText>
      <AppText style={styles.emptyMessage}>{t('review.noReviewsMessage')}</AppText>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t('review.myReviews'),
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        {isLoading && reviews.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        ) : (
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={reviews.length === 0 && styles.listEmpty}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={refetch}
          />
        )}
      </View>
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
  },
  listEmpty: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  comment: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  editForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  ratingPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
