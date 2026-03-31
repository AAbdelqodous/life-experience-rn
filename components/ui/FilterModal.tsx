import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  onClear: () => void;
  filters: {
    categories?: FilterOption[];
    cities?: FilterOption[];
    ratingOptions?: FilterOption[];
    sortOptions?: FilterOption[];
  };
  initialFilters?: Record<string, any>;
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  onClear,
  filters,
  initialFilters = {},
}: FilterModalProps) {
  const { t } = useTranslation();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(initialFilters);

  const handleApply = () => {
    onApply(selectedFilters);
    onClose();
  };

  const handleClear = () => {
    setSelectedFilters({});
    onClear();
    onClose();
  };

  const toggleFilter = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[key];
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          return { ...prev, [key]: current.filter((v) => v !== value) };
        } else {
          return { ...prev, [key]: [...current, value] };
        }
      }
      return { ...prev, [key]: value };
    });
  };

  const setFilter = (key: string, value: any) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
  };

  const FilterSection = ({
    title,
    options,
    filterKey,
    multiSelect = false,
  }: {
    title: string;
    options: FilterOption[];
    filterKey: string;
    multiSelect?: boolean;
  }) => {
    const selectedValue = selectedFilters[filterKey];

    return (
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>{title}</AppText>
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = multiSelect
              ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
              : selectedValue === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, isSelected && styles.selectedOption]}
                onPress={() => toggleFilter(filterKey, option.value)}
              >
                <AppText
                  style={[styles.optionText, isSelected && styles.selectedOptionText]}
                >
                  {option.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText style={styles.title}>{t('filter.title')}</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeIcon}>✕</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {filters.categories && (
              <FilterSection
                title={t('filter.category')}
                options={filters.categories}
                filterKey="category"
              />
            )}
            {filters.cities && (
              <FilterSection
                title={t('filter.city')}
                options={filters.cities}
                filterKey="city"
              />
            )}
            {filters.ratingOptions && (
              <FilterSection
                title={t('filter.minRating')}
                options={filters.ratingOptions}
                filterKey="minRating"
              />
            )}
            {filters.sortOptions && (
              <FilterSection
                title={t('filter.sortBy')}
                options={filters.sortOptions}
                filterKey="sortBy"
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              title={t('filter.clear')}
              variant="secondary"
              onPress={handleClear}
              style={styles.footerButton}
            />
            <AppButton
              title={t('filter.apply')}
              onPress={handleApply}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#757575',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 14,
    color: '#424242',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
