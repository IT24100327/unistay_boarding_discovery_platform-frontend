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
import { getMyReservations, getRentalPeriods } from '@/lib/reservation';
import { getBoardingPayments, getMyPayments } from '@/lib/payment';
import { COLORS } from '@/lib/constants';
import type { Boarding } from '@/types/boarding.types';
import type { Reservation, RentalPeriod } from '@/types/reservation.types';
import type { DetailedPayment } from '@/types/payment.types';

// ─── Active Reservation Card ───────────────────────────────────────────────────
const ACTIVE_RES_BG: Record<string, string> = {
  ACTIVE: '#D1FAE5',
  PENDING: '#FEF3C7',
};
const ACTIVE_RES_COLOR: Record<string, string> = {
  ACTIVE: COLORS.green,
  PENDING: COLORS.orange,
};

function ActiveReservationCard({ reservation }: { reservation: Reservation }) {
  const bg = ACTIVE_RES_BG[reservation.status] ?? '#EBF0FF';
  const color = ACTIVE_RES_COLOR[reservation.status] ?? COLORS.primary;

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <TouchableOpacity
      style={styles.activeResCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/reservations/${reservation.id}` as never)}
    >
      <View style={styles.activeResTop}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.activeResTitle} numberOfLines={1}>
            {reservation.boarding.title}
          </Text>
          <View style={styles.activeResLocation}>
            <Ionicons name="location-outline" size={12} color={COLORS.gray} />
            <Text style={styles.activeResLocationText}>
              {reservation.boarding.city}, {reservation.boarding.district}
            </Text>
          </View>
        </View>
        <View style={[styles.activeResBadge, { backgroundColor: bg }]}>
          <Text style={[styles.activeResBadgeText, { color }]}>
            {reservation.status}
          </Text>
        </View>
      </View>

      <View style={styles.activeResDivider} />

      <View style={styles.activeResBottom}>
        <View style={styles.activeResDetail}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
          <Text style={styles.activeResDetailText}>
            Move-in: {formatDate(reservation.moveInDate)}
          </Text>
        </View>
        <View style={styles.activeResDetail}>
          <Ionicons name="cash-outline" size={13} color={COLORS.primary} />
          <Text style={styles.activeResDetailText}>
            {reservation.rentSnapshot
              ? `LKR ${reservation.rentSnapshot.toLocaleString()}/mo`
              : '—'}
          </Text>
        </View>
      </View>

      {reservation.status === 'PENDING' && reservation.expiresAt && (
        <View style={styles.activeResExpiry}>
          <Ionicons name="time-outline" size={12} color={COLORS.orange} />
          <Text style={styles.activeResExpiryText}>
            Expires: {formatDate(reservation.expiresAt)}
          </Text>
        </View>
      )}

      <View style={styles.activeResArrow}>
        <Text style={styles.activeResViewText}>View Details</Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

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
          <Text style={styles.boardingPrice}>
            {item.monthlyRent ? `LKR ${item.monthlyRent.toLocaleString()}/mo` : '—'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Recent Payment Row ────────────────────────────────────────────────────────
const PMT_STATUS_BG: Record<string, string> = {
  PENDING: '#FEF3C7',
  CONFIRMED: '#D1FAE5',
  REJECTED: '#FEE2E2',
};
const PMT_STATUS_COLOR: Record<string, string> = {
  PENDING: COLORS.orange,
  CONFIRMED: COLORS.green,
  REJECTED: COLORS.red,
};
const PMT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function RecentPaymentRow({ payment }: { payment: DetailedPayment }) {
  const dateStr = (() => {
    const iso = payment.paidAt ?? payment.createdAt;
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getDate()} ${PMT_MONTH[d.getMonth()]} ${d.getFullYear()}`;
  })();

  return (
    <TouchableOpacity
      style={styles.recentPaymentCard}
      activeOpacity={0.85}
      onPress={() => router.push('/payments' as never)}
    >
      <View style={styles.recentPaymentLeft}>
        <Text style={styles.recentPaymentPeriod} numberOfLines={1}>
          {payment.rentalPeriod?.periodLabel ?? '—'}
        </Text>
        {payment.reservation?.boarding?.title && (
          <Text style={styles.recentPaymentBoarding} numberOfLines={1}>
            {payment.reservation.boarding.title}
          </Text>
        )}
        <Text style={styles.recentPaymentDate}>{dateStr}</Text>
      </View>
      <View style={styles.recentPaymentRight}>
        <Text style={styles.recentPaymentAmount}>
          LKR {Number(payment.amount).toLocaleString()}
        </Text>
        <View style={[styles.recentPaymentBadge, { backgroundColor: PMT_STATUS_BG[payment.status] ?? '#F3F4F6' }]}>
          <Text style={[styles.recentPaymentStatus, { color: PMT_STATUS_COLOR[payment.status] ?? COLORS.gray }]}>
            {payment.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Upcoming Payment Card ─────────────────────────────────────────────────────
const PERIOD_STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  OVERDUE:        { bg: '#FEE2E2', color: COLORS.red,     label: 'OVERDUE' },
  DUE:            { bg: '#FEF3C7', color: COLORS.orange,  label: 'DUE' },
  PARTIALLY_PAID: { bg: '#DBEAFE', color: '#1D4ED8',      label: 'PARTIAL' },
  UPCOMING:       { bg: '#EBF0FF', color: COLORS.primary, label: 'UPCOMING' },
  PAID:           { bg: '#D1FAE5', color: COLORS.green,   label: 'PAID' },
};

const PERIOD_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function formatPeriodLabel(label: string): string {
  const parts = label.split('-');
  const year = parts[0];
  const month = parseInt(parts[1] ?? '', 10);
  if (isNaN(month) || !year) return label;
  return `${PERIOD_MONTHS[month - 1] ?? label} ${year}`;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${PMT_MONTH[d.getMonth()]} ${d.getFullYear()}`;
}

function daysFromNow(iso: string): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const now = new Date();
  const target = new Date(iso);
  return Math.ceil((target.getTime() - now.getTime()) / MS_PER_DAY);
}

function UpcomingPaymentCard({
  period,
  nextPeriod,
  reservationId,
}: {
  period: RentalPeriod;
  nextPeriod: RentalPeriod | null;
  reservationId: string;
}) {
  const cfg = PERIOD_STATUS_CONFIG[period.status] ?? PERIOD_STATUS_CONFIG.UPCOMING;
  const isPaid = period.status === 'PAID';
  const nextDays = nextPeriod ? daysFromNow(nextPeriod.dueDate) : null;

  return (
    <View style={styles.upcomingPayCard}>
      <View style={styles.upcomingPayTop}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.upcomingPayPeriod}>{formatPeriodLabel(period.periodLabel)}</Text>
          <Text style={styles.upcomingPayDue}>Due: {formatShortDate(period.dueDate)}</Text>
        </View>
        <View style={[styles.upcomingPayBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.upcomingPayBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.upcomingPayDivider} />

      <View style={styles.upcomingPayAmountRow}>
        <Text style={styles.upcomingPayAmountLabel}>Amount Due</Text>
        <Text style={styles.upcomingPayAmount}>LKR {period.amountDue.toLocaleString()}</Text>
      </View>

      {isPaid ? (
        nextPeriod && nextDays !== null ? (
          <View style={styles.upcomingPayNextRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
            <Text style={styles.upcomingPayNextText}>
              Next payment in{' '}
              <Text style={{ fontWeight: '700', color: COLORS.text }}>
                {nextDays > 0 ? `${nextDays} day${nextDays !== 1 ? 's' : ''}` : 'today'}
              </Text>
              {' '}· {formatPeriodLabel(nextPeriod.periodLabel)}
            </Text>
          </View>
        ) : (
          <View style={styles.upcomingPayNextRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
            <Text style={styles.upcomingPayNextText}>All payments up to date</Text>
          </View>
        )
      ) : (
        <TouchableOpacity
          style={styles.upcomingPayBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/reservations/${reservationId}` as never)}
        >
          <Ionicons name="add-circle-outline" size={16} color={COLORS.white} />
          <Text style={styles.upcomingPayBtnText}>Log Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────────
function StudentHome({ firstName }: { firstName: string }) {
  const [recommended, setRecommended] = useState<Boarding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [recentPayments, setRecentPayments] = useState<DetailedPayment[]>([]);
  const [upcomingPeriod, setUpcomingPeriod] = useState<RentalPeriod | null>(null);
  const [nextPeriod, setNextPeriod] = useState<RentalPeriod | null>(null);

  useEffect(() => {
    searchBoardings({ size: 4 })
      .then((r) => setRecommended(r.data.boarding))
      .catch(() => setRecommended([]))
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(useCallback(() => {
    getMyReservations()
      .then((r) => {
        const reservations = r.data.reservations;
        const active = reservations.find((res) => res.status === 'ACTIVE')
          ?? reservations.find((res) => res.status === 'PENDING')
          ?? null;
        setActiveReservation(active);
        if (active?.status === 'ACTIVE') {
          const PRIORITY: Record<string, number> = { OVERDUE: 0, DUE: 1, PARTIALLY_PAID: 2, UPCOMING: 3, PAID: 99 };
          getRentalPeriods(active.id)
            .then((rp) => {
              const sorted = [...rp.data.rentalPeriods].sort(
                (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
              );
              const current = sorted.slice().sort(
                (a, b) => (PRIORITY[a.status] ?? 99) - (PRIORITY[b.status] ?? 99),
              )[0] ?? null;
              setUpcomingPeriod(current);
              if (current?.status === 'PAID') {
                setNextPeriod(sorted.find((p) => p.status === 'UPCOMING' && p.id !== current.id) ?? null);
              } else {
                setNextPeriod(null);
              }
            })
            .catch(() => { setUpcomingPeriod(null); setNextPeriod(null); });
        } else {
          setUpcomingPeriod(null);
          setNextPeriod(null);
        }
      })
      .catch(() => setActiveReservation(null));
    getMyPayments()
      .then((r) => setRecentPayments(r.data.payments.slice(0, 3)))
      .catch(() => setRecentPayments([]));
  }, []));

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

      {/* Active/Pending Reservation Card */}
      {activeReservation && (
        <View style={styles.activeResSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeReservation.status === 'ACTIVE' ? 'Your Current Home' : 'Pending Application'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/reservations' as never)}>
              <Text style={styles.viewAll}>All reservations</Text>
            </TouchableOpacity>
          </View>
          <ActiveReservationCard reservation={activeReservation} />
        </View>
      )}

      {/* Upcoming Payment */}
      {upcomingPeriod && activeReservation?.status === 'ACTIVE' && (
        <View style={styles.upcomingPaySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Payment</Text>
            <TouchableOpacity onPress={() => router.push(`/reservations/${activeReservation.id}` as never)}>
              <Text style={styles.viewAll}>Details</Text>
            </TouchableOpacity>
          </View>
          <UpcomingPaymentCard
            period={upcomingPeriod}
            nextPeriod={nextPeriod}
            reservationId={activeReservation.id}
          />
        </View>
      )}

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <View style={styles.recentPaymentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            <TouchableOpacity onPress={() => router.push('/payments' as never)}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentPayments.map((p) => (
            <RecentPaymentRow key={p.id} payment={p} />
          ))}
        </View>
      )}

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
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/payments' as never)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#EBF0FF' }]}>
            <Ionicons name="card-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionLabel}>My Payments</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

// ─── Owner View ────────────────────────────────────────────────────────────────
function OwnerHome({ firstName }: { firstName: string }) {
  const [ownerListings, setOwnerListings] = useState<Boarding[]>([]);
  const [ownerPayments, setOwnerPayments] = useState<DetailedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getMyListings()
      .then((r) => setOwnerListings(r.data.boardings))
      .catch(() => setOwnerListings([]))
      .finally(() => setIsLoading(false));
    getBoardingPayments()
      .then((r) => setOwnerPayments(r.data.payments))
      .catch(() => setOwnerPayments([]));
  }, []));

  const pendingPayments = ownerPayments.filter((p) => p.status === 'PENDING');
  const confirmedPayments = ownerPayments.filter((p) => p.status === 'CONFIRMED');
  const totalCollected = confirmedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);

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
          <Text style={styles.ownerStatValue}>{ownerListings.length}</Text>
          <Text style={styles.ownerStatLabel}>Total Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ownerStatCard, { backgroundColor: '#FEF3C7' }]}
          onPress={() => router.push('/my-listings/payments' as never)}
        >
          <Ionicons name="time-outline" size={22} color={COLORS.orange} />
          <Text style={styles.ownerStatValue}>{pendingPayments.length}</Text>
          <Text style={styles.ownerStatLabel}>Awaiting Review</Text>
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
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/my-listings/payments' as never)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FDF4FF' }]}>
            <Ionicons name="card-outline" size={22} color="#9333EA" />
          </View>
          <Text style={styles.quickActionLabel}>Payments</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Overview</Text>
        <TouchableOpacity onPress={() => router.push('/my-listings/payment-history' as never)}>
          <Text style={styles.viewAll}>History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.paymentOverviewRow}>
        <TouchableOpacity
          style={[styles.paymentOverviewCard, { backgroundColor: '#F0FDF4' }]}
          onPress={() => router.push('/my-listings/payment-history' as never)}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.green} />
          <Text style={styles.paymentOverviewAmount}>
            LKR {totalCollected.toLocaleString()}
          </Text>
          <Text style={styles.paymentOverviewLabel}>Collected</Text>
          <Text style={styles.paymentOverviewCount}>{confirmedPayments.length} payments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentOverviewCard, { backgroundColor: '#FFF7ED' }]}
          onPress={() => router.push('/my-listings/payments' as never)}
        >
          <Ionicons name="time-outline" size={20} color={COLORS.orange} />
          <Text style={styles.paymentOverviewAmount}>
            LKR {totalPending.toLocaleString()}
          </Text>
          <Text style={styles.paymentOverviewLabel}>Awaiting Review</Text>
          <Text style={styles.paymentOverviewCount}>{pendingPayments.length} pending</Text>
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

  // Payment Overview
  paymentOverviewRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  paymentOverviewCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentOverviewAmount: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  paymentOverviewLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  paymentOverviewCount: { fontSize: 11, color: COLORS.textSecondary },

  // Active Reservation Card
  activeResSection: { marginBottom: 4 },
  activeResCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  activeResTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  activeResTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  activeResLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  activeResLocationText: { fontSize: 12, color: COLORS.textSecondary },
  activeResBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  activeResBadgeText: { fontSize: 11, fontWeight: '800' },
  activeResDivider: { height: 1, backgroundColor: COLORS.grayLight },
  activeResBottom: { flexDirection: 'row', gap: 16 },
  activeResDetail: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  activeResDetailText: { fontSize: 12, color: COLORS.textSecondary },
  activeResExpiry: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  activeResExpiryText: { fontSize: 11, color: COLORS.orange, fontWeight: '600' },
  activeResArrow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  activeResViewText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // Upcoming Payment Card
  upcomingPaySection: { marginBottom: 4 },
  upcomingPayCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  upcomingPayTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  upcomingPayPeriod: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  upcomingPayDue: { fontSize: 12, color: COLORS.textSecondary },
  upcomingPayBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  upcomingPayBadgeText: { fontSize: 11, fontWeight: '800' },
  upcomingPayDivider: { height: 1, backgroundColor: COLORS.grayLight },
  upcomingPayAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  upcomingPayAmountLabel: { fontSize: 13, color: COLORS.textSecondary },
  upcomingPayAmount: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  upcomingPayNextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  upcomingPayNextText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  upcomingPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
  },
  upcomingPayBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  // Recent Payments
  recentPaymentsSection: { marginBottom: 20 },
  recentPaymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  recentPaymentLeft: { flex: 1, gap: 2 },
  recentPaymentPeriod: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  recentPaymentBoarding: { fontSize: 11, color: COLORS.textSecondary },
  recentPaymentDate: { fontSize: 11, color: COLORS.textSecondary },
  recentPaymentRight: { alignItems: 'flex-end', gap: 4 },
  recentPaymentAmount: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  recentPaymentBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  recentPaymentStatus: { fontSize: 10, fontWeight: '700' },
});
