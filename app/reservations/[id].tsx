import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getReservationById, getRentalPeriods, cancelReservation } from '@/lib/reservation';
import { COLORS } from '@/lib/constants';
import type { Reservation, RentalPeriod, ReservationStatus, RentalPeriodStatus } from '@/types/reservation.types';

// ─── Status config ──────────────────────────────────────────────────────────────
const STATUS_BG: Record<ReservationStatus, string> = {
  PENDING: '#FEF3C7',
  ACTIVE: '#D1FAE5',
  REJECTED: '#FEE2E2',
  COMPLETED: '#F3F4F6',
  CANCELLED: '#F3F4F6',
  EXPIRED: '#FEE2E2',
};

const STATUS_COLOR: Record<ReservationStatus, string> = {
  PENDING: COLORS.orange,
  ACTIVE: COLORS.green,
  REJECTED: COLORS.red,
  COMPLETED: COLORS.textSecondary,
  CANCELLED: COLORS.textSecondary,
  EXPIRED: COLORS.red,
};

const PERIOD_STATUS_BG: Record<RentalPeriodStatus, string> = {
  UPCOMING: '#EBF0FF',
  DUE: '#FEF3C7',
  PARTIALLY_PAID: '#FEF3C7',
  PAID: '#D1FAE5',
  OVERDUE: '#FEE2E2',
};

const PERIOD_STATUS_COLOR: Record<RentalPeriodStatus, string> = {
  UPCOMING: COLORS.primary,
  DUE: COLORS.orange,
  PARTIALLY_PAID: COLORS.orange,
  PAID: COLORS.green,
  OVERDUE: COLORS.red,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}, ${h}:${m}`;
}

// ─── Rental Period Row ──────────────────────────────────────────────────────────
function RentalPeriodRow({ period }: { period: RentalPeriod }) {
  return (
    <View style={styles.periodRow}>
      <View style={styles.periodLeft}>
        <Text style={styles.periodLabel}>{period.periodLabel}</Text>
        <Text style={styles.periodDue}>Due: {formatDate(period.dueDate)}</Text>
        {period.payments.length > 0 && (
          <Text style={styles.periodPaid}>
            {period.payments.filter((p) => p.status === 'CONFIRMED').length} payment(s) confirmed
          </Text>
        )}
      </View>
      <View style={styles.periodRight}>
        <Text style={styles.periodAmount}>LKR {(period.amountDue ?? 0).toLocaleString()}</Text>
        <View style={[styles.periodBadge, { backgroundColor: PERIOD_STATUS_BG[period.status] }]}>
          <Text style={[styles.periodBadgeText, { color: PERIOD_STATUS_COLOR[period.status] }]}>
            {period.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Detail row helper ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────────
export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [rentalPeriods, setRentalPeriods] = useState<RentalPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [periodsExpanded, setPeriodsExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getReservationById(id)
      .then((res) => setReservation(res.data.reservation))
      .catch(() => Alert.alert('Error', 'Failed to load reservation details.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleTogglePeriods = async () => {
    if (!periodsExpanded && rentalPeriods.length === 0 && reservation?.id) {
      setLoadingPeriods(true);
      try {
        const res = await getRentalPeriods(reservation.id);
        setRentalPeriods(res.data.rentalPeriods);
      } catch {
        Alert.alert('Error', 'Failed to load rental periods.');
      } finally {
        setLoadingPeriods(false);
      }
    }
    setPeriodsExpanded((v) => !v);
  };

  const handleCancel = () => {
    if (!reservation) return;
    Alert.alert(
      'Cancel Reservation',
      reservation.status === 'ACTIVE'
        ? 'Cancelling an ACTIVE reservation will also decrement the occupancy count. Are you sure?'
        : 'Are you sure you want to cancel this reservation?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const res = await cancelReservation(reservation.id);
              setReservation(res.data.reservation);
            } catch (err: unknown) {
              const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                'Failed to cancel reservation.';
              Alert.alert('Error', message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Reservation Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Reservation Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Reservation not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Reservation Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: STATUS_BG[reservation.status] }]}>
          <Text style={[styles.statusBannerText, { color: STATUS_COLOR[reservation.status] }]}>
            {reservation.status}
          </Text>
          <Text style={styles.statusBannerSub}>
            {reservation.status === 'PENDING' && 'Awaiting owner approval'}
            {reservation.status === 'ACTIVE' && 'You are an active tenant'}
            {reservation.status === 'REJECTED' && 'Reservation was rejected'}
            {reservation.status === 'CANCELLED' && 'Reservation was cancelled'}
            {reservation.status === 'COMPLETED' && 'Tenancy completed'}
            {reservation.status === 'EXPIRED' && 'Reservation expired without approval'}
          </Text>
        </View>

        {/* Boarding section */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Boarding</Text>
          <Text style={styles.boardingTitle}>{reservation.boarding.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
            <Text style={styles.locationText}>
              {reservation.boarding.city}, {reservation.boarding.district}
            </Text>
          </View>
        </View>

        {/* Reservation details */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Details</Text>
          <InfoRow
            icon="calendar-outline"
            label="Move-in Date"
            value={formatDate(reservation.moveInDate)}
          />
          <InfoRow
            icon="cash-outline"
            label="Monthly Rent"
            value={reservation.rentSnapshot ? `LKR ${reservation.rentSnapshot.toLocaleString()}` : '—'}
          />
          <InfoRow
            icon="time-outline"
            label="Applied On"
            value={formatDateTime(reservation.createdAt)}
          />
          <InfoRow
            icon="refresh-outline"
            label="Last Updated"
            value={formatDateTime(reservation.updatedAt)}
          />
          {reservation.status === 'PENDING' && reservation.expiresAt && (
            <View style={styles.expiryBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.orange} />
              <Text style={styles.expiryText}>
                Expires on {formatDateTime(reservation.expiresAt)} — owner must approve before then
              </Text>
            </View>
          )}
        </View>

        {/* Special requests */}
        {reservation.specialRequests ? (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Special Requests</Text>
            <Text style={styles.specialRequestsText}>{reservation.specialRequests}</Text>
          </View>
        ) : null}

        {/* Rejection / Cancellation reason */}
        {(reservation.status === 'REJECTED' || reservation.status === 'CANCELLED') &&
          reservation.rejectionReason ? (
          <View style={[styles.card, styles.rejectionCard]}>
            <Text style={styles.rejectionLabel}>
              {reservation.status === 'REJECTED' ? 'Rejection Reason' : 'Cancellation Reason'}
            </Text>
            <Text style={styles.rejectionText}>{reservation.rejectionReason}</Text>
          </View>
        ) : null}

        {/* Rental Periods (ACTIVE only) */}
        {reservation.status === 'ACTIVE' && (
          <View style={styles.card}>
            <TouchableOpacity style={styles.periodsHeader} onPress={handleTogglePeriods}>
              <Text style={styles.cardSectionTitle}>Rental Periods</Text>
              <Ionicons
                name={periodsExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            {periodsExpanded && (
              <>
                {loadingPeriods ? (
                  <ActivityIndicator color={COLORS.primary} style={{ padding: 16 }} />
                ) : rentalPeriods.length === 0 ? (
                  <Text style={styles.emptyPeriodsText}>No rental periods found.</Text>
                ) : (
                  rentalPeriods.map((p) => <RentalPeriodRow key={p.id} period={p} />)
                )}
              </>
            )}
          </View>
        )}

        {/* Cancel button */}
        {(reservation.status === 'PENDING' || reservation.status === 'ACTIVE') && (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={COLORS.red} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={18} color={COLORS.red} />
                <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15, color: COLORS.textSecondary },

  scrollContent: { padding: 16, gap: 12 },

  statusBanner: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statusBannerText: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  statusBannerSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },

  boardingTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: COLORS.textSecondary },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EBF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: { flex: 1, gap: 1 },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },

  expiryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  expiryText: { flex: 1, fontSize: 12, color: COLORS.orange, fontWeight: '600', lineHeight: 18 },

  specialRequestsText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },

  rejectionCard: { borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FFF1F0' },
  rejectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.red, textTransform: 'uppercase', letterSpacing: 0.4 },
  rejectionText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },

  periodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyPeriodsText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 8 },

  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  periodLeft: { gap: 2, flex: 1 },
  periodLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  periodDue: { fontSize: 12, color: COLORS.textSecondary },
  periodPaid: { fontSize: 12, color: COLORS.green },
  periodRight: { alignItems: 'flex-end', gap: 4 },
  periodAmount: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  periodBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  periodBadgeText: { fontSize: 11, fontWeight: '700' },

  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },
  cancelBtnText: { fontSize: 15, color: COLORS.red, fontWeight: '700' },
});
