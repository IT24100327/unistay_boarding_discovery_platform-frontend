import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoardingStore } from '@/store/boarding.store';
import { COLORS } from '@/lib/constants';
import type { BoardingType, GenderPreference, BoardingFilters } from '@/types/boarding.types';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Batticaloa', 'Ampara',
  'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa',
  'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
];

const BOARDING_TYPES: { label: string; value: BoardingType }[] = [
  { label: 'Single Room', value: 'SINGLE_ROOM' },
  { label: 'Shared Room', value: 'SHARED_ROOM' },
  { label: 'Annex', value: 'ANNEX' },
  { label: 'Full House', value: 'FULL_HOUSE' },
];

const GENDER_OPTIONS: { label: string; value: GenderPreference }[] = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Any', value: 'ANY' },
];

const DISTANCE_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '< 1 km', value: 1 },
  { label: '< 2 km', value: 2 },
  { label: '< 5 km', value: 5 },
  { label: '< 10 km', value: 10 },
];

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  parking: 'Parking',
  furnished: 'Furnished',
  ac: 'Air Conditioning',
  hotWater: 'Hot Water',
};

export default function FilterScreen() {
  const { filters, setFilters, clearFilters } = useBoardingStore();

  const [district, setDistrict] = useState(filters.district ?? '');
  const [city, setCity] = useState(filters.city ?? '');
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? '');
  const [selectedTypes, setSelectedTypes] = useState<BoardingType[]>(filters.types ?? []);
  const [genderPref, setGenderPref] = useState<GenderPreference | undefined>(filters.genderPreference);
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    wifi: filters.amenities?.wifi ?? false,
    parking: filters.amenities?.parking ?? false,
    furnished: filters.amenities?.furnished ?? false,
    ac: filters.amenities?.ac ?? false,
    hotWater: filters.amenities?.hotWater ?? false,
  });
  const [maxDistance, setMaxDistance] = useState<number | undefined>(filters.maxDistance);
  const [university, setUniversity] = useState(filters.university ?? '');
  const [showDistricts, setShowDistricts] = useState(false);

  const toggleType = (t: BoardingType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t],
    );
  };

  const toggleAmenity = (key: string) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearAll = () => {
    setDistrict('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedTypes([]);
    setGenderPref(undefined);
    setAmenities({ wifi: false, parking: false, furnished: false, ac: false, hotWater: false });
    setMaxDistance(undefined);
    setUniversity('');
    clearFilters();
  };

  const handleShowResults = () => {
    const newFilters: BoardingFilters = {};
    if (district) newFilters.district = district;
    if (city) newFilters.city = city;
    if (minPrice) newFilters.minPrice = parseInt(minPrice, 10);
    if (maxPrice) newFilters.maxPrice = parseInt(maxPrice, 10);
    if (selectedTypes.length) newFilters.types = selectedTypes;
    if (genderPref) newFilters.genderPreference = genderPref;
    if (maxDistance) newFilters.maxDistance = maxDistance;
    if (university) newFilters.university = university;
    const activeAmenities = Object.fromEntries(
      Object.entries(amenities).filter(([, v]) => v),
    );
    if (Object.keys(activeAmenities).length) {
      newFilters.amenities = activeAmenities as BoardingFilters['amenities'];
    }
    setFilters(newFilters);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearBtn}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDistricts((v) => !v)}
        >
          <Text style={district ? styles.dropdownValue : styles.dropdownPlaceholder}>
            {district || 'Select District'}
          </Text>
          <Ionicons name={showDistricts ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray} />
        </TouchableOpacity>
        {showDistricts && (
          <View style={styles.dropdownMenu}>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {DISTRICTS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={styles.dropdownItem}
                  onPress={() => { setDistrict(d); setShowDistricts(false); }}
                >
                  <Text style={[styles.dropdownItemText, district === d && styles.dropdownItemActive]}>{d}</Text>
                  {district === d && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="City (e.g. Kelaniya)"
          placeholderTextColor={COLORS.grayBorder}
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.sectionTitle}>Price Range (LKR)</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Min"
            placeholderTextColor={COLORS.grayBorder}
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="number-pad"
          />
          <Text style={styles.priceSep}>–</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Max"
            placeholderTextColor={COLORS.grayBorder}
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="number-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Boarding Type</Text>
        <View style={styles.chipRow}>
          {BOARDING_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.multiChip, selectedTypes.includes(t.value) && styles.multiChipActive]}
              onPress={() => toggleType(t.value)}
            >
              <Text style={[styles.multiChipText, selectedTypes.includes(t.value) && styles.multiChipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Gender Preference</Text>
        <View style={styles.chipRow}>
          {GENDER_OPTIONS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.multiChip, genderPref === g.value && styles.multiChipActive]}
              onPress={() => setGenderPref(genderPref === g.value ? undefined : g.value)}
            >
              <Text style={[styles.multiChipText, genderPref === g.value && styles.multiChipTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Amenities</Text>
        {Object.keys(AMENITY_LABELS).map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.checkboxRow}
            onPress={() => toggleAmenity(key)}
          >
            <View style={[styles.checkbox, amenities[key] && styles.checkboxChecked]}>
              {amenities[key] && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
            </View>
            <Text style={styles.checkboxLabel}>{AMENITY_LABELS[key]}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Distance to University</Text>
        <View style={styles.chipRow}>
          {DISTANCE_OPTIONS.map((d) => (
            <TouchableOpacity
              key={String(d.value)}
              style={[styles.multiChip, maxDistance === d.value && styles.multiChipActive]}
              onPress={() => setMaxDistance(d.value)}
            >
              <Text style={[styles.multiChipText, maxDistance === d.value && styles.multiChipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nearest University"
          placeholderTextColor={COLORS.grayBorder}
          value={university}
          onChangeText={setUniversity}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
          <Text style={styles.clearAllBtnText}>Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.showResultsBtn} onPress={handleShowResults}>
          <Text style={styles.showResultsBtnText}>Show Results</Text>
        </TouchableOpacity>
      </View>
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
  closeBtn: { width: 36 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  clearBtn: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginTop: 16 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    marginBottom: 10,
  },
  dropdownValue: { fontSize: 15, color: COLORS.text },
  dropdownPlaceholder: { fontSize: 15, color: COLORS.grayBorder },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  dropdownItemText: { fontSize: 14, color: COLORS.text },
  dropdownItemActive: { color: COLORS.primary, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    marginBottom: 10,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceInput: { flex: 1, marginBottom: 0 },
  priceSep: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  multiChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.white,
  },
  multiChipActive: { borderColor: COLORS.primary, backgroundColor: '#EBF0FF' },
  multiChipText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  multiChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: 15, color: COLORS.text },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
  },
  clearAllBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  showResultsBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showResultsBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
