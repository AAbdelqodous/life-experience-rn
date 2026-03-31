import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ServiceCategory } from '../../store/api/centersApi';
import { AppText } from '../ui/AppText';

interface ServiceCardProps {
  category: ServiceCategory;
  onPress?: (category: ServiceCategory) => void;
}

export default function ServiceCard({ category, onPress }: ServiceCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.dir() === 'rtl';

  const name = isRTL ? category.nameAr : category.nameEn;
  const description = isRTL ? category.descriptionAr : category.descriptionEn;

  const handlePress = () => {
    onPress?.(category);
    router.push({ pathname: '/(app)/(tabs)/centers', params: { categoryId: String(category.id) } });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {category.icon ? (
          <AppText style={styles.icon}>{category.icon}</AppText>
        ) : (
          <AppText style={styles.icon}>🔧</AppText>
        )}
      </View>
      <View style={styles.content}>
        <AppText style={styles.name} numberOfLines={1}>
          {name}
        </AppText>
        {description && (
          <AppText style={styles.description} numberOfLines={2}>
            {description}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
});
