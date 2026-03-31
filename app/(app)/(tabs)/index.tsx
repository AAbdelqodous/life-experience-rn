import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CenterCard from '../../../components/listings/CenterCard';
import { AppText } from '../../../components/ui/AppText';
import { useAppSelector } from '../../../store';
import { useGetCategoriesQuery, useGetCentersQuery } from '../../../store/api/centersApi';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.dir() === 'rtl';

  const { user } = useAppSelector((state) => state.auth);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: featuredCentersData } = useGetCentersQuery({
    page: 0,
    size: 5,
    sortBy: 'rating',
    sortOrder: 'desc',
  });
  const { data: nearbyCentersData } = useGetCentersQuery({
    page: 0,
    size: 5,
    sortBy: 'distance',
    sortOrder: 'asc',
  });

  const handleCategoryPress = (categoryId: number) => {
    router.push({
      pathname: '/(app)/(tabs)/centers',
      params: { categoryId: String(categoryId) },
    });
  };

  const handleSeeAll = (type: 'featured' | 'nearby') => {
    router.push({
      pathname: '/(app)/(tabs)/centers',
      params: { sortBy: type === 'featured' ? 'rating' : 'distance' },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText style={styles.welcome}>
            {t('home.welcome', { name: user?.firstname || t('common.loading') })}
          </AppText>
          <AppText style={styles.subtitle}>{t('home.title')}</AppText>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/(app)/(tabs)/notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>{t('home.categories')}</AppText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categoriesData?.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
            >
              <View style={styles.categoryIcon}>
                <AppText style={styles.categoryIconText}>
                  {category.icon || '🔧'}
                </AppText>
              </View>
              <AppText style={styles.categoryName} numberOfLines={1}>
                {isRTL ? category.nameAr : category.nameEn}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Centers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>{t('home.featuredCenters')}</AppText>
          <TouchableOpacity onPress={() => handleSeeAll('featured')}>
            <AppText style={styles.seeAll}>{t('home.seeAll')}</AppText>
          </TouchableOpacity>
        </View>
        {featuredCentersData?.content && featuredCentersData.content.length > 0 ? (
          featuredCentersData.content.map((center) => (
            <CenterCard key={center.id} center={center} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color="#9E9E9E" />
            <AppText style={styles.emptyText}>{t('home.noCenters')}</AppText>
            <AppText style={styles.emptySubtext}>
              {t('home.noCentersMessage')}
            </AppText>
          </View>
        )}
      </View>

      {/* Nearby Centers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>{t('home.nearbyCenters')}</AppText>
          <TouchableOpacity onPress={() => handleSeeAll('nearby')}>
            <AppText style={styles.seeAll}>{t('home.seeAll')}</AppText>
          </TouchableOpacity>
        </View>
        {nearbyCentersData?.content && nearbyCentersData.content.length > 0 ? (
          nearbyCentersData.content.map((center) => (
            <CenterCard key={center.id} center={center} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color="#9E9E9E" />
            <AppText style={styles.emptyText}>{t('home.noCenters')}</AppText>
            <AppText style={styles.emptySubtext}>
              {t('home.noCentersMessage')}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
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
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  notificationButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  seeAll: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 4,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 12,
    color: '#1A1A2E',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
  bottomSpacing: {
    height: 20,
  },
});
