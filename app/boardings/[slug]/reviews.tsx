import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SAMPLE_BOARDINGS, SAMPLE_REVIEWS } from '@/store/boarding.store';
import { COLORS } from '@/lib/constants';

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={14}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarLabel}>{stars}★</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.ratingBarCount}>{count}</Text>
    </View>
  );
}

export default function BoardingReviewsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const boarding = SAMPLE_BOARDINGS.find((b) => b.slug === slug || b.id === slug) ?? SAMPLE_BOARDINGS[0];

  const totalReviews = SAMPLE_REVIEWS.length;
  const averageRating =
    totalReviews > 0
      ? SAMPLE_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: SAMPLE_REVIEWS.filter((r) => Math.round(r.rating) === s).length,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall rating */}
        <View style={styles.overallCard}>
          <View style={styles.overallLeft}>
            <Text style={styles.overallScore}>{averageRating.toFixed(1)}</Text>
            <StarRow rating={averageRating} />
            <Text style={styles.overallCount}>{totalReviews} reviews</Text>
          </View>
          <View style={styles.overallRight}>
            {ratingBreakdown.map(({ stars, count }) => (
              <RatingBar key={stars} stars={stars} count={count} total={totalReviews} />
            ))}
          </View>
        </View>

        {/* Reviews list */}
        {SAMPLE_REVIEWS.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>{review.reviewerName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                <StarRow rating={review.rating} />
              </View>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}

        {SAMPLE_REVIEWS.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={56} color={COLORS.grayBorder} />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySub}>Be the first to leave a review</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBorder,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: 20, gap: 12 },

  // Overall
  overallCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 4,
  },
  overallLeft: { alignItems: 'center', gap: 4, minWidth: 72 },
  overallScore: { fontSize: 40, fontWeight: '800', color: COLORS.text },
  overallCount: { fontSize: 12, color: COLORS.textSecondary },
  overallRight: { flex: 1, gap: 4, justifyContent: 'center' },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBarLabel: { fontSize: 12, color: COLORS.textSecondary, width: 20 },
  ratingBarTrack: { flex: 1, height: 6, backgroundColor: COLORS.grayLight, borderRadius: 3, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 },
  ratingBarCount: { fontSize: 12, color: COLORS.textSecondary, width: 20, textAlign: 'right' },

  // Review cards
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  reviewerName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  reviewDate: { fontSize: 11, color: COLORS.gray },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.textSecondary },
});
