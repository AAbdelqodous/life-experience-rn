import CenterCard from '@/components/listings/CenterCard';
import { AppText } from '@/components/ui/AppText';
import FilterModal from '@/components/ui/FilterModal';
import { useAppDispatch, useAppSelector } from '@/store';
import { useGetMyFavoritesQuery } from '@/store/api/favoritesApi';
import { clearFavoritesFilters, setFavoritesFilters } from '@/store/favoritesSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isRTL = i18n.dir() === 'rtl';

  const filters = useAppSelector((state) => state.favorites.filters);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const { data: favoritesData, isLoading, refetch } = useGetMyFavoritesQuery({
    page: 0,
    size: 20,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    dispatch(setFavoritesFilters(newFilters));
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFavoritesFilters());
    setFilterModalVisible(false);
  };

  const handleExploreCenters = () => {
    router.push('/(app)/(tabs)/centers');
  };

  const renderFavorite = ({ item }: { item: any }) => {
    const center = {
      id: item.centerId,
      nameAr: item.centerNameAr,
      nameEn: item.centerNameEn,
      descriptionAr: item.centerDescriptionAr,
      descriptionEn: item.centerDescriptionEn,
      address: item.centerAddress,
      phone: item.centerPhone,
      averageRating: item.centerAverageRating,
      reviewCount: item.centerReviewCount,
      imageUrl: item.centerImageUrl,
      isVerified: true,
      isOpen: true,
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
      categories: [],
    };

    return <CenterCard center={center} isFavorite={true} />;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={48} color="#9E9E9E" />
      <AppText style={styles.emptyText}>{t('favorites.noFavorites')}</AppText>
      <AppText style={styles.emptySubtext}>{t('favorites.noFavoritesMessage')}</AppText>
      <TouchableOpacity style={styles.exploreButton} onPress={handleExploreCenters}>
        <AppText style={styles.exploreButtonText}>
          {t('favorites.exploreCenters')}
        </AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>{t('favorites.title')}</AppText>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favoritesData?.content || []}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          favoritesData?.content?.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        filters={{
          sortOptions: [
            { label: t('filter.sortOptions.rating'), value: 'rating' },
            { label: t('filter.sortOptions.name'), value: 'name' },
            { label: t('common.date'), value: 'date' },
          ],
        }}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  listContent: {
    padding: 20,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#1A1A2E',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
