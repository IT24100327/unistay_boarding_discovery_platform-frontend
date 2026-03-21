import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { SAMPLE_BOARDINGS } from '@/store/boarding.store';
import { useSaveBoarding } from '@/hooks/useSaveBoarding';
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
          <Text style={styles.boardingPrice}>LKR {item.monthlyRent.toLocaleString()}/mo</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────
function StudentHome({ firstName }: { firstName: string }) {
  const recommended = SAMPLE_BOARDINGS.slice(0, 4);
  const recentlyViewed = SAMPLE_BOARDINGS.slice(1, 4);
  const marketplaceItems = [
    { id: 'm1', name: 'Calculus Textbook', price: 'LKR 800', emoji: '📚' },
    { id: 'm2', name: 'Mini Fridge', price: 'LKR 6,500', emoji: '🧊' },
    { id: 'm3', name: 'Study Desk Lamp', price: 'LKR 1,200', emoji: '💡' },
  ];

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

      {/* Quick Stats */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsRow}
        contentContainerStyle={styles.statsRowContent}
      >
        <TouchableOpacity style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
          <Ionicons name="home" size={20} color={COLORS.white} />
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.85)' }]}>Active Reservation</Text>
          <Text style={[styles.statValue, { color: COLORS.white }]}>Room 302</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="card-outline" size={20} color={COLORS.orange} />
          <Text style={[styles.statLabel, { color: COLORS.orange }]}>Payment Due</Text>
          <Text style={[styles.statValue, { color: COLORS.text }]}>5 days</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#EBF0FF' }]}
          onPress={() => router.push('/(tabs)/messages' as never)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.statLabel, { color: COLORS.primary }]}>Unread Messages</Text>
          <Text style={[styles.statValue, { color: COLORS.text }]}>3</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Recommended for You */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search' as never)}>
          <Text style={styles.viewAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recommended}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <BoardingCard item={item} />}
      />

      {/* Recently Viewed */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>Clear</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentlyViewed}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <BoardingCard item={item} />}
      />

      {/* Marketplace Highlights */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Marketplace Highlights</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.marketplaceRow}>
        {marketplaceItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.marketItem} activeOpacity={0.8}>
            <Text style={styles.marketEmoji}>{item.emoji}</Text>
            <Text style={styles.marketName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.marketPrice}>{item.price}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom CTA */}
      <TouchableOpacity
        style={styles.exploreBtn}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/search' as never)}
      >
        <Ionicons name="compass-outline" size={18} color={COLORS.white} />
        <Text style={styles.exploreBtnText}>Explore All Boardings</Text>
      </TouchableOpacity>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

// ─── Owner View ────────────────────────────────────────────────────────────────
function OwnerHome({ firstName }: { firstName: string }) {
  const ownerListings = SAMPLE_BOARDINGS.filter((b) => b.owner.id === 'o1');

  const recentActivity = [
    { id: 'a1', icon: 'calendar-outline' as const, text: 'New reservation request for The Hub', time: '2h ago' },
    { id: 'a2', icon: 'checkmark-circle-outline' as const, text: 'Payment confirmed – Room 302', time: '1d ago' },
    { id: 'a3', icon: 'person-add-outline' as const, text: 'New inquiry from Dilshan K.', time: '2d ago' },
  ];

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
          style={[styles.ownerStatCard, { backgroundColor: '#EBF0FF' }]}
          onPress={() => router.push('/my-listings' as never)}
        >
          <Ionicons name="home-outline" size={22} color={COLORS.primary} />
          <Text style={styles.ownerStatValue}>4</Text>
          <Text style={styles.ownerStatLabel}>Total Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ownerStatCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="time-outline" size={22} color={COLORS.orange} />
          <Text style={styles.ownerStatValue}>2</Text>
          <Text style={styles.ownerStatLabel}>Pending Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ownerStatCard, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="card-outline" size={22} color={COLORS.red} />
          <Text style={styles.ownerStatValue}>1</Text>
          <Text style={styles.ownerStatLabel}>Pending Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ownerStatCard, { backgroundColor: '#D1FAE5' }]}>
          <Ionicons name="trending-up-outline" size={22} color={COLORS.green} />
          <Text style={styles.ownerStatValue}>LKR 45K</Text>
          <Text style={styles.ownerStatLabel}>This Month</Text>
        </TouchableOpacity>
      </View>

      {/* Your Listings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Listings</Text>
        <TouchableOpacity onPress={() => router.push('/my-listings' as never)}>
          <Text style={styles.viewAll}>Manage</Text>
        </TouchableOpacity>
      </View>
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

      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.activityList}>
        {recentActivity.map((item) => (
          <View key={item.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name={item.icon} size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>

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

  // Quick Stats (Student)
  statsRow: { marginBottom: 20 },
  statsRowContent: { paddingHorizontal: 20, gap: 12 },
  statCard: {
    borderRadius: 14,
    padding: 14,
    minWidth: 130,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statLabel: { fontSize: 11, fontWeight: '500' },
  statValue: { fontSize: 16, fontWeight: '700' },

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

  // Marketplace
  marketplaceRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  marketItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  marketEmoji: { fontSize: 24, marginBottom: 6 },
  marketName: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  marketPrice: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginTop: 2 },

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

  // Recent Activity
  activityList: { paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  activityTime: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

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
