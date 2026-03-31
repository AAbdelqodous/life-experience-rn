import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import CenterCard from '../../components/listings/CenterCard';
import { AppText } from '../../components/ui/AppText';
import SearchBar from '../../components/ui/SearchBar';
import { useAppDispatch, useAppSelector } from '../../store';
import { useLazySearchCentersQuery } from '../../store/api/centersApi';
import { addRecentSearch, clearRecentSearches } from '../../store/centersSlice';

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isRTL = i18n.dir() === 'rtl';

  const recentSearches = useAppSelector((state: any) => state.centers.recentSearches);

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [searchCenters, { data: searchResults, isLoading, isUninitialized }] = useLazySearchCentersQuery();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(addRecentSearch(searchQuery.trim()));
      searchCenters({ query: searchQuery.trim(), params: { page: 0, size: 20 } });
      setHasSearched(true);
    }
  };

  const handleClearHistory = () => {
    dispatch(clearRecentSearches());
  };

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    dispatch(addRecentSearch(query));
    searchCenters({ query, params: { page: 0, size: 20 } });
    setHasSearched(true);
  };

  const handleCenterPress = (centerId: number) => {
    router.push({
      pathname: '/(app)/(tabs)/centers/[id]',
      params: { id: String(centerId) },
    });
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <CenterCard center={item} />
  );

  const renderEmpty = () => {
    if (!hasSearched) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color="#9E9E9E" />
        <AppText style={styles.emptyText}>{t('search.noResults')}</AppText>
        <AppText style={styles.emptySubtext}>{t('search.noResultsMessage')}</AppText>
      </View>
    );
  };

  const renderRecentSearch = (search: string) => (
    <TouchableOpacity
      key={search}
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(search)}
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
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* Recent Searches */}
      {!hasSearched && recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentSearchesHeader}>
            <AppText style={styles.recentSearchesTitle}>
              {t('search.recentSearches')}
            </AppText>
            <TouchableOpacity onPress={handleClearHistory}>
              <AppText style={styles.clearHistory}>{t('search.clearHistory')}</AppText>
            </TouchableOpacity>
          </View>
          {recentSearches.map(renderRecentSearch)}
        </View>
      )}

      {/* Search Results */}
      {hasSearched && (
        <FlatList
          data={searchResults?.content || []}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            searchResults?.content?.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => {
            if (searchQuery.trim()) {
              searchCenters({ query: searchQuery.trim(), params: { page: 0, size: 20 } });
            }
          }}
        />
      )}

      {/* Empty State (No Recent Searches) */}
      {!hasSearched && recentSearches.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#9E9E9E" />
          <AppText style={styles.emptyText}>{t('search.title')}</AppText>
          <AppText style={styles.emptySubtext}>
            {t('search.placeholder')}
          </AppText>
        </View>
      )}
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
  backButton: {
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
