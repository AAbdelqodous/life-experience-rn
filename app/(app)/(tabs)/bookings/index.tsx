import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import BookingCard from '../../../../components/listings/BookingCard';
import { AppText } from '../../../../components/ui/AppText';
import FilterModal from '../../../../components/ui/FilterModal';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { useGetMyBookingsQuery } from '../../../../store/api/bookingsApi';
import { clearBookingFilters, setBookingFilters } from '../../../../store/bookingsSlice';

export default function BookingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isRTL = i18n.dir() === 'rtl';

  const filters = useAppSelector((state) => state.bookings.filters);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const { data: bookingsData, isLoading, refetch } = useGetMyBookingsQuery({
    status: filters.status,
  });

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    dispatch(setBookingFilters(newFilters));
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    dispatch(clearBookingFilters());
    setFilterModalVisible(false);
  };

  const handleNewBooking = () => {
    router.push('/(app)/(tabs)/bookings/new');
  };

  const renderBooking = ({ item }: { item: any }) => (
    <BookingCard booking={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color="#9E9E9E" />
      <AppText style={styles.emptyText}>{t('booking.noBookings')}</AppText>
      <AppText style={styles.emptySubtext}>{t('booking.noBookingsMessage')}</AppText>
      <TouchableOpacity style={styles.newBookingButton} onPress={handleNewBooking}>
        <AppText style={styles.newBookingButtonText}>
          {t('booking.bookYourFirstService')}
        </AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>{t('booking.myBookings')}</AppText>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookingsData || []}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          (!bookingsData || bookingsData.length === 0) && styles.listContentEmpty,
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
          categories: [
            { label: t('booking.status.pending'), value: 'PENDING' },
            { label: t('booking.status.confirmed'), value: 'CONFIRMED' },
            { label: t('booking.status.in_progress'), value: 'IN_PROGRESS' },
            { label: t('booking.status.completed'), value: 'COMPLETED' },
            { label: t('booking.status.cancelled'), value: 'CANCELLED' },
            { label: t('booking.status.rejected'), value: 'REJECTED' },
          ],
          cities: [
            { label: t('booking.serviceType.car'), value: 'CAR' },
            { label: t('booking.serviceType.electronics'), value: 'ELECTRONICS' },
            { label: t('booking.serviceType.homeAppliance'), value: 'HOME_APPLIANCE' },
          ],
          sortOptions: [
            { label: t('filter.sortOptions.rating'), value: 'date' },
            { label: t('booking.statusLabel'), value: 'status' },
            { label: t('booking.estimatedPrice'), value: 'price' },
          ],
        }}
        initialFilters={filters}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleNewBooking}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  newBookingButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newBookingButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
