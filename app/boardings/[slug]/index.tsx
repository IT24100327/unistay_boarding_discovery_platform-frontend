import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { getBoardingBySlug, getBoardingReviews } from '@/lib/boarding';
import { useSaveBoarding } from '@/hooks/useSaveBoarding';
import { COLORS } from '@/lib/constants';
import type { Boarding, BoardingReview } from '@/types/boarding.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_DESCRIPTION_PREVIEW_LENGTH = 120;

const TYPE_LABELS: Record<string, string> = {
  SINGLE_ROOM: 'Single Room',
  SHARED_ROOM: 'Shared Room',
  ANNEX: 'Annex',
  HOUSE: 'House',
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male Only',
  FEMALE: 'Female Only',
  ANY: 'Any Gender',
};

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

function AmenityRow({ icon, label, active }: { icon: string; label: string; active: boolean }) {
  return (
    <View style={[styles.amenityItem, !active && styles.amenityItemInactive]}>
      <Ionicons name={icon as never} size={20} color={active ? COLORS.primary : COLORS.grayBorder} />
      <Text style={[styles.amenityLabel, !active && styles.amenityLabelInactive]}>{label}</Text>
    </View>
  );
}

export default function BoardingDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuthStore();

  const [boarding, setBoarding] = useState<Boarding | null>(null);
  const [reviews, setReviews] = useState<BoardingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  const { saved, toggleSave } = useSaveBoarding(boarding?.id ?? '');
  const isOwner = user?.role === 'OWNER';
  const isOwnListing = isOwner && boarding !== null && boarding.ownerId === user?.id;
  const isAvailable = boarding !== null && boarding.currentOccupants < boarding.maxOccupants;

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    Promise.all([
      getBoardingBySlug(slug).then((r) => setBoarding(r.data.boarding)),
      getBoardingReviews(slug).then((r) => setReviews(r.data.reviews)).catch(() => setReviews([])),
    ])
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!boarding) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray} />
          <Text style={styles.notFoundText}>Boarding not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
            <Text style={styles.goBackBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[]}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={boarding.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(img) => img.id}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImage(idx);
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => router.push(`/boardings/${slug}/gallery` as never)}
              >
                <Image source={{ uri: item.url }} style={styles.carouselImage} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={[styles.carouselImage, styles.carouselPlaceholder]}>
                <Ionicons name="home-outline" size={48} color={COLORS.gray} />
              </View>
            }
          />
          {boarding.images.length > 1 && (
            <View style={styles.paginationDots}>
              {boarding.images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Back + Share + Save */}
          <View style={styles.carouselOverlay}>
            <TouchableOpacity style={styles.carouselBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.carouselBtn}>
                <Ionicons name="share-outline" size={20} color={COLORS.white} />
              </TouchableOpacity>
              {!isOwner && (
                <TouchableOpacity style={styles.carouselBtn} onPress={toggleSave}>
                  <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? COLORS.red : COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Basic Info */}
          <Text style={styles.title}>{boarding.title}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
            <Text style={styles.addressText}>{boarding.address}, {boarding.city}</Text>
            <TouchableOpacity onPress={() => router.push(`/explore/map` as never)}>
              <Text style={styles.viewOnMap}>View on Map</Text>
            </TouchableOpacity>
          </View>
          {boarding.nearUniversity && (
            <Text style={styles.distanceText}>
              Near {boarding.nearUniversity}
            </Text>
          )}
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>{boarding.owner.firstName.charAt(0)}</Text>
            </View>
            <Text style={styles.ownerName}>{boarding.owner.firstName} {boarding.owner.lastName}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Pricing */}
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingRow}>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingValue}>LKR {boarding.monthlyRent.toLocaleString()}</Text>
              <Text style={styles.pricingLabel}>Monthly Rent</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Details */}
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{TYPE_LABELS[boarding.boardingType]}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{GENDER_LABELS[boarding.genderPref]}</Text>
            </View>
            <View style={[styles.badge, isAvailable ? styles.badgeAvailable : styles.badgeFull]}>
              <Text style={[styles.badgeText, isAvailable ? styles.badgeAvailableText : styles.badgeFullText]}>
                {isAvailable ? 'Available' : 'Full'}
              </Text>
            </View>
          </View>
          <Text style={styles.occupancyText}>
            Occupancy: {boarding.currentOccupants} / {boarding.maxOccupants} occupied
          </Text>

          <View style={styles.divider} />

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {[
              { name: 'WIFI', icon: 'wifi-outline', label: 'WiFi' },
              { name: 'PARKING', icon: 'car-outline', label: 'Parking' },
              { name: 'AIR_CONDITIONING', icon: 'snow-outline', label: 'AC' },
              { name: 'HOT_WATER', icon: 'water-outline', label: 'Hot Water' },
              { name: 'SECURITY', icon: 'shield-checkmark-outline', label: 'Security' },
              { name: 'KITCHEN', icon: 'restaurant-outline', label: 'Kitchen' },
              { name: 'LAUNDRY', icon: 'shirt-outline', label: 'Laundry' },
              { name: 'GENERATOR', icon: 'flash-outline', label: 'Generator' },
            ].map(({ name, icon, label }) => (
              <AmenityRow
                key={name}
                icon={icon}
                label={label}
                active={boarding.amenities.some((a) => a.name === name)}
              />
            ))}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText} numberOfLines={descExpanded ? undefined : 4}>
            {boarding.description}
          </Text>
          {boarding.description.length > MAX_DESCRIPTION_PREVIEW_LENGTH && (
            <TouchableOpacity onPress={() => setDescExpanded((v) => !v)}>
              <Text style={styles.expandLink}>{descExpanded ? 'Show less' : 'Read more'}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* House Rules */}
          {boarding.rules.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>House Rules</Text>
              {boarding.rules.map((ruleItem) => (
                <View key={ruleItem.id} style={styles.ruleItem}>
                  <Ionicons name="ellipse" size={6} color={COLORS.primary} />
                  <Text style={styles.ruleText}>{ruleItem.rule}</Text>
                </View>
              ))}
              <View style={styles.divider} />
            </>
          )}

          {/* Location */}
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.mapPlaceholder}
            onPress={() => router.push('/explore/map' as never)}
          >
            <Ionicons name="map-outline" size={36} color={COLORS.gray} />
            <Text style={styles.mapPlaceholderText}>{boarding.address}, {boarding.city}</Text>
            <Text style={styles.mapPlaceholderSub}>Tap to view on map</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
          </View>
          {reviews.slice(0, 2).map((review) => (
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
          <TouchableOpacity
            style={styles.seeAllReviews}
            onPress={() => router.push(`/boardings/${slug}/reviews` as never)}
          >
            <Text style={styles.seeAllReviewsText}>See All Reviews</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        {isOwnListing ? (
          <>
            <TouchableOpacity
              style={[styles.footerBtn, styles.footerBtnSecondary]}
              onPress={() => router.push(`/my-listings/${boarding.id}/analytics` as never)}
            >
              <Text style={styles.footerBtnSecondaryText}>View Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerBtn, styles.footerBtnPrimary]}
              onPress={() => router.push(`/my-listings/${boarding.id}/edit` as never)}
            >
              <Text style={styles.footerBtnPrimaryText}>Edit Listing</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.footerBtn, styles.footerBtnSecondary]}>
              <Text style={styles.footerBtnSecondaryText}>Contact Owner</Text>
            </TouchableOpacity>
            {!isOwner && isAvailable && (
              <TouchableOpacity style={[styles.footerBtn, styles.footerBtnPrimary]}>
                <Text style={styles.footerBtnPrimaryText}>Request Reservation</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  goBackBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 10 },
  goBackBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Carousel
  carouselContainer: { position: 'relative' },
  carouselImage: { width: SCREEN_WIDTH, height: 280 },
  carouselPlaceholder: { backgroundColor: COLORS.grayLight, alignItems: 'center', justifyContent: 'center' },
  paginationDots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: COLORS.white, width: 18 },
  carouselOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carouselBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4, flexWrap: 'wrap' },
  addressText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  viewOnMap: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  distanceText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ratingLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  ownerName: { fontSize: 14, fontWeight: '500', color: COLORS.text },

  divider: { height: 1, backgroundColor: COLORS.grayLight, marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },

  // Pricing
  pricingRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, gap: 0 },
  pricingItem: { flex: 1, alignItems: 'center' },
  pricingValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  pricingLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  pricingDivider: { width: 1, backgroundColor: COLORS.grayBorder },

  // Details
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  badge: { backgroundColor: '#EBF0FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  badgeAvailable: { backgroundColor: '#D1FAE5' },
  badgeFull: { backgroundColor: '#FEE2E2' },
  badgeAvailableText: { color: COLORS.green },
  badgeFullText: { color: COLORS.red },
  occupancyText: { fontSize: 13, color: COLORS.textSecondary },

  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF0FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amenityItemInactive: { backgroundColor: COLORS.grayLight },
  amenityLabel: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  amenityLabelInactive: { color: COLORS.grayBorder },

  // Description
  descriptionText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  expandLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 6 },

  // House rules
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  ruleText: { fontSize: 14, color: COLORS.textSecondary },

  // Map placeholder
  mapPlaceholder: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 14,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  mapPlaceholderText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  mapPlaceholderSub: { fontSize: 11, color: COLORS.gray },

  // Reviews
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  overallRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  overallRatingText: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  overallRatingCount: { fontSize: 13, color: COLORS.textSecondary },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
  seeAllReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  seeAllReviewsText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
  },
  footerBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnPrimary: { backgroundColor: COLORS.primary },
  footerBtnSecondary: { borderWidth: 1.5, borderColor: COLORS.primary },
  footerBtnPrimaryText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  footerBtnSecondaryText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
});
