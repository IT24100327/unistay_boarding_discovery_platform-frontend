import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { useBoardingStore, SAMPLE_BOARDINGS } from '@/store/boarding.store';
import { COLORS } from '@/lib/constants';
import type { Boarding, SortOption } from '@/types/boarding.types';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Relevance', value: 'RELEVANCE' },
  { label: 'Price: Low to High', value: 'PRICE_ASC' },
  { label: 'Price: High to Low', value: 'PRICE_DESC' },
  { label: 'Newest', value: 'NEWEST' },
];

function AmenityIcon({ name, active }: { name: string; active: boolean }) {
  const iconMap: Record<string, string> = {
    wifi: 'wifi-outline',
    parking: 'car-outline',
    furnished: 'bed-outline',
    ac: 'snow-outline',
    hotWater: 'water-outline',
  };
  return (
    <Ionicons
      name={iconMap[name] as never}
      size={14}
      color={active ? COLORS.primary : COLORS.grayBorder}
    />
  );
}

function BoardingListCard({ item }: { item: Boarding }) {
  const { user } = useAuthStore();
  const { toggleSaved, isSaved } = useBoardingStore();
  const saved = isSaved(item.id);
  const isStudent = user?.role !== 'OWNER';
  const primaryImage = item.images.find((img) => img.isPrimary) ?? item.images[0];

  const typeLabel: Record<string, string> = {
    SINGLE_ROOM: 'Single Room',
    SHARED_ROOM: 'Shared Room',
    ANNEX: 'Annex',
    FULL_HOUSE: 'Full House',
  };
  const genderLabel: Record<string, string> = {
    MALE: 'Male Only',
    FEMALE: 'Female Only',
    ANY: 'Any Gender',
  };

  return (
    <TouchableOpacity
      style={styles.listCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/boardings/${item.slug}` as never)}
    >
      <View style={styles.listCardImageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage.url }} style={styles.listCardImage} />
        ) : (
          <View style={[styles.listCardImage, styles.imagePlaceholder]}>
            <Ionicons name="home-outline" size={28} color={COLORS.gray} />
          </View>
        )}
      </View>
      <View style={styles.listCardBody}>
        <View style={styles.listCardHeader}>
          <Text style={styles.listCardTitle} numberOfLines={1}>{item.title}</Text>
          {isStudent && (
            <TouchableOpacity onPress={() => toggleSaved(item.id)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? COLORS.red : COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.listCardAddress} numberOfLines={1}>
          <Ionicons name="location-outline" size={11} color={COLORS.gray} /> {item.addressLine}, {item.city}
        </Text>
        <Text style={styles.listCardPrice}>LKR {item.monthlyRent.toLocaleString()}<Text style={styles.listCardPriceSuffix}>/mo</Text></Text>
        <View style={styles.listCardBadgeRow}>
          <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{typeLabel[item.type]}</Text></View>
          <View style={styles.genderBadge}><Text style={styles.genderBadgeText}>{genderLabel[item.genderPreference]}</Text></View>
        </View>
        <View style={styles.listCardFooter}>
          <View style={styles.amenityIcons}>
            <AmenityIcon name="wifi" active={item.amenities.wifi} />
            <AmenityIcon name="parking" active={item.amenities.parking} />
            <AmenityIcon name="furnished" active={item.amenities.furnished} />
            <AmenityIcon name="ac" active={item.amenities.ac} />
            <AmenityIcon name="hotWater" active={item.amenities.hotWater} />
          </View>
          {item.nearestUniversity && (
            <Text style={styles.distanceText}>{item.distanceToUniversity}km away</Text>
          )}
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)} ({item.reviewCount})</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { filters, sortOption, setSortOption, clearFilters } = useBoardingStore();

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.district) chips.push({ key: 'district', label: filters.district });
    if (filters.city) chips.push({ key: 'city', label: filters.city });
    if (filters.maxPrice) chips.push({ key: 'maxPrice', label: `< LKR ${filters.maxPrice.toLocaleString()}` });
    if (filters.genderPreference) chips.push({ key: 'genderPreference', label: filters.genderPreference });
    return chips;
  }, [filters]);

  const filteredData = useMemo(() => {
    let data = SAMPLE_BOARDINGS.filter((b) => b.status === 'ACTIVE');
    if (query) {
      data = data.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.city.toLowerCase().includes(query.toLowerCase()) ||
          b.district.toLowerCase().includes(query.toLowerCase()),
      );
    }
    if (filters.district) data = data.filter((b) => b.district === filters.district);
    if (filters.city) data = data.filter((b) => b.city === filters.city);
    if (filters.minPrice) data = data.filter((b) => b.monthlyRent >= (filters.minPrice ?? 0));
    if (filters.maxPrice) data = data.filter((b) => b.monthlyRent <= (filters.maxPrice ?? Infinity));
    if (filters.genderPreference) data = data.filter((b) => b.genderPreference === filters.genderPreference);

    if (sortOption === 'PRICE_ASC') data = [...data].sort((a, b) => a.monthlyRent - b.monthlyRent);
    else if (sortOption === 'PRICE_DESC') data = [...data].sort((a, b) => b.monthlyRent - a.monthlyRent);
    else if (sortOption === 'NEWEST') data = [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return data;
  }, [query, filters, sortOption]);

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete (newFilters as Record<string, unknown>)[key];
    useBoardingStore.getState().setFilters(newFilters);
  };

  const renderItem: ListRenderItem<Boarding> = ({ item }) => <BoardingListCard item={item} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search boardings..."
              placeholderTextColor={COLORS.grayBorder}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/explore/filter' as never)}
          >
            <Ionicons name="options-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/explore/map' as never)}
          >
            <Ionicons name="map-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <View style={styles.chipsRow}>
            {activeFilterChips.map((chip) => (
              <TouchableOpacity key={chip.key} style={styles.chip} onPress={() => removeFilter(chip.key)}>
                <Text style={styles.chipText}>{chip.label}</Text>
                <Ionicons name="close" size={12} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearAll}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sort + count row */}
        <View style={styles.sortRow}>
          <Text style={styles.resultCount}>{filteredData.length} boardings found</Text>
          <View>
            <TouchableOpacity
              style={styles.sortBtn}
              onPress={() => setShowSortMenu((v) => !v)}
            >
              <Ionicons name="swap-vertical-outline" size={16} color={COLORS.primary} />
              <Text style={styles.sortBtnText}>
                {SORT_OPTIONS.find((s) => s.value === sortOption)?.label ?? 'Sort'}
              </Text>
              <Ionicons name={showSortMenu ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.primary} />
            </TouchableOpacity>
            {showSortMenu && (
              <View style={styles.sortMenu}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.sortMenuItem}
                    onPress={() => { setSortOption(opt.value); setShowSortMenu(false); }}
                  >
                    <Text style={[styles.sortMenuText, sortOption === opt.value && styles.sortMenuTextActive]}>
                      {opt.label}
                    </Text>
                    {sortOption === opt.value && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => setShowSortMenu(false)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={56} color={COLORS.grayBorder} />
            <Text style={styles.emptyTitle}>No boardings found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Search header
  searchHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    gap: 8,
    zIndex: 10,
  },
  searchInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF0FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  clearAll: { fontSize: 12, color: COLORS.red, fontWeight: '600', marginLeft: 4 },

  // Sort row
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultCount: { fontSize: 13, color: COLORS.textSecondary },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  sortMenu: {
    position: 'absolute',
    right: 0,
    top: 28,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 180,
    zIndex: 100,
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  sortMenuText: { fontSize: 14, color: COLORS.text },
  sortMenuTextActive: { color: COLORS.primary, fontWeight: '600' },

  // List
  list: { padding: 16, gap: 12 },

  // List card
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  listCardImageContainer: { width: 110 },
  listCardImage: { width: 110, height: 130 },
  imagePlaceholder: { backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center' },
  listCardBody: { flex: 1, padding: 12, gap: 4 },
  listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  listCardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, marginRight: 6 },
  listCardAddress: { fontSize: 12, color: COLORS.textSecondary },
  listCardPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  listCardPriceSuffix: { fontSize: 12, fontWeight: '400', color: COLORS.textSecondary },
  listCardBadgeRow: { flexDirection: 'row', gap: 6 },
  typeBadge: { backgroundColor: '#EBF0FF', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  genderBadge: { backgroundColor: '#F3F4F6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  genderBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  listCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  amenityIcons: { flexDirection: 'row', gap: 6 },
  distanceText: { fontSize: 11, color: COLORS.textSecondary },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, color: COLORS.text, fontWeight: '600' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
});
