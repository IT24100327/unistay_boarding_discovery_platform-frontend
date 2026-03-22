import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { useSaveBoarding } from '@/hooks/useSaveBoarding';
import { searchBoardings, getMyListings } from '@/lib/boarding';
import { COLORS } from '@/lib/constants';
import type { Boarding } from '@/types/boarding.types';

// ─── Boarding Card ─────────────────────────────────────────────────────────────
function BoardingCard({ item, showOccupancy }: { item: Boarding; showOccupancy?: boolean }) {
  const { saved, toggleSave } = useSaveBoarding(item.id);
  const primaryImage = item.images[0];

  return (
    <TouchableOpacity
      style={styles.boardingCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/boardings/${item.slug}` as never)}
    >
      <View style={styles.boardingImageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage.url }} style={styles.boardingImage} />
        ) : (
          <View style={[styles.boardingImage, styles.boardingImagePlaceholder]}>
            <Ionicons name="home-outline" size={32} color={COLORS.gray} />
          </View>
        )}
        {showOccupancy && (
          <View style={styles.occupancyBadge}>
            <Text style={styles.occupancyText}>
              {item.currentOccupants}/{item.maxOccupants}
            </Text>
          </View>
        )}
        {!showOccupancy && (
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
      <View style={styles.boardingCardBody}>
        <Text style={styles.boardingTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.boardingAddress} numberOfLines={1}>
          <Ionicons name="location-outline" size={11} color={COLORS.gray} /> {item.city}
        </Text>
        <View style={styles.boardingFooter}>
          <Text style={styles.boardingPrice}>LKR {(item.monthlyRent ?? 0).toLocaleString()}/mo</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────
function StudentHome({ firstName }: { firstName: string }) {
  const [recommended, setRecommended] = useState<Boarding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchBoardings({ size: 4 })
      .then((r) => setRecommended(r.data.boarding))
      .catch(() => setRecommended([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back 👋</Text>
          <Text style={styles.nameText}>Hi, {firstName}!</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/search' as never)}
      >
        <Ionicons name="search-outline" size={18} color={COLORS.gray} />
        <Text style={styles.searchPlaceholder}>Search boardings...</Text>
        <Ionicons name="options-outline" size={18} color={COLORS.gray} />
      </TouchableOpacity>

      {/* Recommended for You */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search' as never)}>
          <Text style={styles.viewAll}>See all</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.sectionLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={recommended}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => <BoardingCard item={item} />}
          ListEmptyComponent={
            <View style={styles.horizontalEmpty}>
              <Text style={styles.horizontalEmptyText}>No boardings available right now</Text>
            </View>
          }
        />
      )}

      {/* Bottom CTA */}
      <TouchableOpacity
        style={styles.exploreBtn}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/search' as never)}
      >
        <Ionicons name="compass-outline" size={18} color={COLORS.white} />
        <Text style={styles.exploreBtnText}>Explore All Boardings</Text>
      </TouchableOpacity>

      {/* Quick Links */}
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/visits' as never)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="eye-outline" size={22} color={COLORS.orange} />
          </View>
          <Text style={styles.quickActionLabel}>My Visits</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/reservations' as never)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.green} />
          </View>
          <Text style={styles.quickActionLabel}>My Reservations</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

// ─── Owner View ────────────────────────────────────────────────────────────────
function OwnerHome({ firstName }: { firstName: string }) {
  const [ownerListings, setOwnerListings] = useState<Boarding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getMyListings()
      .then((r) => setOwnerListings(r.data.boardings))
      .catch(() => setOwnerListings([]))
      .finally(() => setIsLoading(false));
  }, []));

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Good day 👋</Text>
          <Text style={styles.nameText}>Welcome, {firstName}!</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.ownerStatsGrid}>
        <TouchableOpacity
          style={[styles.ownerStatCard, { backgroundColor: '#EBF0FF', width: '100%' }]}
          onPress={() => router.push('/my-listings' as never)}
        >
          <Ionicons name="home-outline" size={22} color={COLORS.primary} />
          <Text style={styles.ownerStatValue}>{ownerListings.length}</Text>
          <Text style={styles.ownerStatLabel}>Total Listings</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Manage</Text>
      </View>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/my-listings/visits' as never)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="eye-outline" size={22} color={COLORS.orange} />
          </View>
          <Text style={styles.quickActionLabel}>Visit Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/my-listings/reservations' as never)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#EBF0FF' }]}>
            <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionLabel}>Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/my-listings/tenants' as never)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="people-outline" size={22} color={COLORS.green} />
          </View>
          <Text style={styles.quickActionLabel}>Tenants</Text>
        </TouchableOpacity>
      </View>

      {/* Your Listings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Listings</Text>
        <TouchableOpacity onPress={() => router.push('/my-listings' as never)}>
          <Text style={styles.viewAll}>Manage</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.sectionLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={ownerListings}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => <BoardingCard item={item} showOccupancy />}
          ListEmptyComponent={
            <TouchableOpacity
              style={styles.emptyListingCard}
              onPress={() => router.push('/boardings/create/step1' as never)}
            >
              <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
              <Text style={styles.emptyListingText}>Create your first listing</Text>
            </TouchableOpacity>
          }
        />
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'OWNER';
  const firstName = user?.firstName ?? 'there';

  return (
    <SafeAreaView style={styles.container}>
      {isOwner ? (
        <OwnerHome firstName={firstName} />
      ) : (
        <StudentHome firstName={firstName} />
      )}

      {/* FAB for owners */}
      {isOwner && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => router.push('/boardings/create/step1' as never)}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  welcomeText: { fontSize: 13, color: COLORS.textSecondary },
  nameText: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  searchPlaceholder: { flex: 1, fontSize: 15, color: COLORS.textSecondary },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },

  // Horizontal list
  horizontalList: { paddingHorizontal: 20, paddingBottom: 4 },
  sectionLoader: { height: 160, alignItems: 'center', justifyContent: 'center' },
  horizontalEmpty: { paddingHorizontal: 20, paddingVertical: 40 },
  horizontalEmptyText: { fontSize: 14, color: COLORS.textSecondary },

  // Boarding Card
  boardingCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  boardingImageContainer: { position: 'relative' },
  boardingImage: { width: '100%', height: 120 },
  boardingImagePlaceholder: {
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupancyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  occupancyText: { fontSize: 11, color: COLORS.white, fontWeight: '700' },
  boardingCardBody: { padding: 10 },
  boardingTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  boardingAddress: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  boardingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  boardingPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Explore CTA
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  exploreBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },

  // Owner Stats Grid
  ownerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  ownerStatCard: {
    flex: 1,
    minWidth: '44%',
    borderRadius: 14,
    padding: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  ownerStatValue: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  ownerStatLabel: { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  // Empty listing card
  emptyListingCard: {
    width: 180,
    height: 160,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.grayBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginLeft: 20,
  },
  emptyListingText: { fontSize: 13, color: COLORS.primary, fontWeight: '600', textAlign: 'center', paddingHorizontal: 10 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
