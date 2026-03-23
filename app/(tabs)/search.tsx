import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ListRenderItem,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { useBoardingStore } from '@/store/boarding.store';
import { useSaveBoarding } from '@/hooks/useSaveBoarding';
import { searchBoardings } from '@/lib/boarding';
import { COLORS } from '@/lib/constants';
import type { Boarding, SortOption } from '@/types/boarding.types';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - 16 * 2 - 10) / 2; // 2-column grid

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Relevance', value: 'RELEVANCE' },
  { label: 'Price ↑', value: 'PRICE_ASC' },
  { label: 'Price ↓', value: 'PRICE_DESC' },
  { label: 'Newest', value: 'NEWEST' },
];

const TYPE_LABELS: Record<string, string> = {
  SINGLE_ROOM: 'Single Room',
  SHARED_ROOM: 'Shared Room',
  ANNEX: 'Annex',
  HOUSE: 'House',
};

// ─── Boarding Card (2-column grid, image on top) ───────────────────────────────
function BoardingCard({ item }: { item: Boarding }) {
  const { user } = useAuthStore();
  const { saved, toggleSave } = useSaveBoarding(item.id);
  const isStudent = user?.role !== 'OWNER';
  const primaryImage = item.images[0];
  const isAvailable = item.currentOccupants < item.maxOccupants;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => router.push(`/boardings/${item.slug}` as never)}
    >
      {/* Image */}
      <View style={styles.cardImageWrap}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage.url }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Ionicons name="home-outline" size={30} color={COLORS.gray} />
          </View>
        )}
        {/* Availability badge */}
        <View style={[styles.availBadge, isAvailable ? styles.availBadgeGreen : styles.availBadgeRed]}>
          <Text style={styles.availBadgeText}>{isAvailable ? 'Available' : 'Full'}</Text>
        </View>
        {/* Heart button — students only */}
        {isStudent && (
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={toggleSave}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={18}
              color={saved ? COLORS.red : COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardLocationRow}>
          <Ionicons name="location-outline" size={11} color={COLORS.gray} />
          <Text style={styles.cardLocation} numberOfLines={1}>{item.city}</Text>
        </View>
        <Text style={styles.cardPrice}>
          {item.monthlyRent ? `LKR ${item.monthlyRent.toLocaleString()}` : '—'}
          <Text style={styles.cardPriceSuffix}>/mo</Text>
        </Text>
        <View style={styles.cardTypeBadge}>
          <Text style={styles.cardTypeBadgeText}>{TYPE_LABELS[item.boardingType] ?? item.boardingType}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [boardings, setBoardings] = useState<Boarding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const { filters, sortOption, setSortOption, clearFilters } = useBoardingStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortParams = useMemo(() => {
    if (sortOption === 'PRICE_ASC') return { sortBy: 'monthlyRent' as const, sortDir: 'asc' as const };
    if (sortOption === 'PRICE_DESC') return { sortBy: 'monthlyRent' as const, sortDir: 'desc' as const };
    if (sortOption === 'NEWEST') return { sortBy: 'createdAt' as const, sortDir: 'desc' as const };
    return {};
  }, [sortOption]);

  const fetchBoardings = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const result = await searchBoardings({
        search: query || undefined,
        city: filters.city,
        district: filters.district,
        minRent: filters.minRent,
        maxRent: filters.maxRent,
        boardingType: filters.boardingType,
        genderPref: filters.genderPref,
        amenities: filters.amenities,
        nearUniversity: filters.nearUniversity,
        size: 50,
        ...sortParams,
      });
      setBoardings(result.data.boarding);
      setTotal(result.data.pagination.total);
    } catch {
      setBoardings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { fetchBoardings(); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, sortParams]);

  // Count active filters for FAB / chips
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.district) n++;
    if (filters.city) n++;
    if (filters.minRent) n++;
    if (filters.maxRent) n++;
    if (filters.boardingType) n++;
    if (filters.genderPref) n++;
    if (filters.amenities?.length) n += filters.amenities.length;
    if (filters.nearUniversity) n++;
    return n;
  }, [filters]);

  const renderItem: ListRenderItem<Boarding> = ({ item }) => <BoardingCard item={item} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Search Header ── */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
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

          {/* Filter button — badge when active */}
          <TouchableOpacity
            style={[styles.headerIconBtn, activeFilterCount > 0 && styles.headerIconBtnActive]}
            onPress={() => router.push('/explore/filter' as never)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? COLORS.white : COLORS.text}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Map button */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/explore/map' as never)}
          >
            <Ionicons name="map-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Sort + result count row */}
        <View style={styles.metaRow}>
          <Text style={styles.resultCount}>
            {isLoading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''}`}
          </Text>
          <View>
            <TouchableOpacity
              style={styles.sortBtn}
              onPress={() => setShowSortMenu((v) => !v)}
            >
              <Ionicons name="swap-vertical-outline" size={15} color={COLORS.primary} />
              <Text style={styles.sortBtnText}>
                {SORT_OPTIONS.find((s) => s.value === sortOption)?.label ?? 'Sort'}
              </Text>
              <Ionicons
                name={showSortMenu ? 'chevron-up' : 'chevron-down'}
                size={13}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            {showSortMenu && (
              <View style={styles.sortMenu}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.sortMenuItem}
                    onPress={() => { setSortOption(opt.value); setShowSortMenu(false); }}
                  >
                    <Text
                      style={[styles.sortMenuText, sortOption === opt.value && styles.sortMenuTextActive]}
                    >
                      {opt.label}
                    </Text>
                    {sortOption === opt.value && (
                      <Ionicons name="checkmark" size={15} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── List ── */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={boardings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setShowSortMenu(false)}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchBoardings(true)}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={56} color={COLORS.grayBorder} />
              <Text style={styles.emptyTitle}>No boardings found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.emptyResetBtn} onPress={clearFilters}>
                  <Text style={styles.emptyResetText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* ── Clear Filters FAB (visible only when filters are active) ── */}
      {activeFilterCount > 0 && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={clearFilters}
        >
          <Ionicons name="close-circle-outline" size={18} color={COLORS.white} />
          <Text style={styles.fabText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnActive: { backgroundColor: COLORS.primary },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },

  // Meta row (result count + sort)
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: { fontSize: 13, color: COLORS.textSecondary },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  sortMenu: {
    position: 'absolute',
    right: 0,
    top: 26,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 160,
    zIndex: 100,
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  sortMenuText: { fontSize: 14, color: COLORS.text },
  sortMenuTextActive: { color: COLORS.primary, fontWeight: '600' },

  // Grid list
  listContent: { padding: 16, paddingBottom: 100 },
  columnWrapper: { gap: 10, marginBottom: 10 },

  // Card
  card: {
    width: CARD_W,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImageWrap: { width: '100%', height: 140, position: 'relative' },
  cardImage: { width: '100%', height: 140 },
  cardImagePlaceholder: {
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  availBadgeGreen: { backgroundColor: 'rgba(34,197,94,0.85)' },
  availBadgeRed: { backgroundColor: 'rgba(239,68,68,0.85)' },
  availBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 10, gap: 4 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, lineHeight: 18 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardLocation: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  cardPriceSuffix: { fontSize: 11, fontWeight: '400', color: COLORS.textSecondary },
  cardTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EBF0FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 2,
  },
  cardTypeBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
  emptyResetBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  emptyResetText: { fontSize: 14, color: COLORS.white, fontWeight: '600' },

  // Clear Filters FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
