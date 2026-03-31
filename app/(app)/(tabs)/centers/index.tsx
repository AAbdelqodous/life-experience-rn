import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import CenterCard from '../../../../components/listings/CenterCard';
import { AppText } from '../../../../components/ui/AppText';
import FilterModal from '../../../../components/ui/FilterModal';
import SearchBar from '../../../../components/ui/SearchBar';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { useGetCategoriesQuery, useGetCentersQuery } from '../../../../store/api/centersApi';
import { addRecentSearch, setFilters } from '../../../../store/centersSlice';

export default function CentersScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const isRTL = i18n.dir() === 'rtl';

  const filters = useAppSelector((state) => state.centers.filters);
  const recentSearches = useAppSelector((state) => state.centers.recentSearches);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Parse params from URL
  const categoryIdParam = params.categoryId ? Number(params.categoryId) : undefined;
  const sortByParam = params.sortBy as 'rating' | 'distance' | 'name' | 'reviews' | undefined;

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: centersData, isLoading, refetch } = useGetCentersQuery({
    page: 0,
    size: 20,
    categoryId: categoryIdParam || filters.categoryId,
    city: filters.city,
    area: filters.area,
    search: searchQuery || filters.searchQuery,
    minRating: filters.minRating,
    isVerified: filters.isVerified,
    isOpen: filters.isOpen,
    sortBy: sortByParam || filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(addRecentSearch(searchQuery.trim()));
    }
    refetch();
  };

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    dispatch(setFilters(newFilters));
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    dispatch(setFilters({}));
    setFilterModalVisible(false);
  };

  const renderCenter = ({ item }: { item: any }) => (
    <CenterCard center={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="business-outline" size={48} color="#9E9E9E" />
      <AppText style={styles.emptyText}>{t('search.noResults')}</AppText>
      <AppText style={styles.emptySubtext}>{t('search.noResultsMessage')}</AppText>
    </View>
  );

  const renderRecentSearch = (search: string) => (
    <TouchableOpacity
      key={search}
      style={styles.recentSearchItem}
      onPress={() => {
        setSearchQuery(search);
        dispatch(addRecentSearch(search));
        refetch();
      }}
    >
      <Ionicons name="time-outline" size={20} color="#757575" />
      <AppText style={styles.recentSearchText}>{search}</AppText>
      <TouchableOpacity
        onPress={() => {
          // Handle remove recent search
        }}
      >
        <Ionicons name="close-outline" size={20} color="#9E9E9E" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          placeholder={t('search.placeholder')}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* Recent Searches */}
      {searchQuery === '' && recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentSearchesHeader}>
            <AppText style={styles.recentSearchesTitle}>
              {t('search.recentSearches')}
            </AppText>
            <TouchableOpacity
              onPress={() => {
                // Handle clear all recent searches
              }}
            >
              <AppText style={styles.clearHistory}>{t('search.clearHistory')}</AppText>
            </TouchableOpacity>
          </View>
          {recentSearches.map(renderRecentSearch)}
        </View>
      )}

      {/* Centers List */}
      <FlatList
        data={centersData?.content || []}
        renderItem={renderCenter}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          centersData?.content?.length === 0 && styles.listContentEmpty,
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
          categories: categoriesData?.map((cat) => ({
            label: isRTL ? cat.nameAr : cat.nameEn,
            value: cat.id.toString(),
          })),
          cities: [
            { label: 'Kuwait City', value: 'Kuwait City' },
            { label: 'Hawally', value: 'Hawally' },
            { label: 'Ahmadi', value: 'Ahmadi' },
            { label: 'Jahra', value: 'Jahra' },
            { label: 'Farwaniya', value: 'Farwaniya' },
            { label: 'Mubarak Al-Kabeer', value: 'Mubarak Al-Kabeer' },
          ],
          ratingOptions: [
            { label: t('filter.ratingOptions.4'), value: '4' },
            { label: t('filter.ratingOptions.3'), value: '3' },
            { label: t('filter.ratingOptions.2'), value: '2' },
            { label: t('filter.ratingOptions.1'), value: '1' },
          ],
          sortOptions: [
            { label: t('filter.sortOptions.rating'), value: 'rating' },
            { label: t('filter.sortOptions.distance'), value: 'distance' },
            { label: t('filter.sortOptions.name'), value: 'name' },
            { label: t('filter.sortOptions.reviews'), value: 'reviews' },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    padding: 12,
    marginLeft: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  recentSearchesContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  clearHistory: {
    fontSize: 14,
    color: '#2196F3',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
    marginHorizontal: 12,
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
  },
});
