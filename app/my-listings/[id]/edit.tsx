import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBoardingById, updateBoarding, submitBoardingForApproval } from '@/lib/boarding';
import type { UpdateBoardingPayload } from '@/lib/boarding';
import { COLORS } from '@/lib/constants';
import type { Boarding, BoardingType, GenderPreference } from '@/types/boarding.types';

type ApiError = { response?: { data?: { message?: string; details?: { field: string; message: string }[] } } };

const BOARDING_TYPES: { label: string; value: BoardingType }[] = [
  { label: 'Single Room', value: 'SINGLE_ROOM' },
  { label: 'Shared Room', value: 'SHARED_ROOM' },
  { label: 'Annex', value: 'ANNEX' },
  { label: 'House', value: 'HOUSE' },
];

const GENDER_OPTIONS: { label: string; value: GenderPreference }[] = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Any', value: 'ANY' },
];

export default function EditBoardingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [boarding, setBoarding] = useState<Boarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BoardingType>('SINGLE_ROOM');
  const [gender, setGender] = useState<GenderPreference>('ANY');
  const [rent, setRent] = useState('');
  const [maxOccupants, setMaxOccupants] = useState('1');

  useEffect(() => {
    if (!id) return;
    getBoardingById(id)
      .then((result) => {
        const b = result.data.boarding;
        setBoarding(b);
        setTitle(b.title);
        setDescription(b.description);
        setType(b.boardingType);
        setGender(b.genderPref);
        setRent(String(b.monthlyRent));
        setMaxOccupants(String(b.maxOccupants));
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to load the listing. Please try again.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const isLocked = boarding?.status === 'ACTIVE';

  const validate = (): boolean => {
    if (!title.trim()) { Alert.alert('Required', 'Please enter a title.'); return false; }
    if (title.trim().length < 10) { Alert.alert('Invalid', 'Title must be at least 10 characters.'); return false; }
    if (!description.trim()) { Alert.alert('Required', 'Please enter a description.'); return false; }
    if (description.trim().length < 30) { Alert.alert('Invalid', 'Description must be at least 30 characters.'); return false; }
    const rentNum = parseInt(rent, 10);
    if (isNaN(rentNum) || rentNum < 1000) { Alert.alert('Invalid', 'Monthly rent must be at least LKR 1,000.'); return false; }
    return true;
  };

  const doSave = async () => {
    if (!boarding) return;
    if (!validate()) return;

    const payload: UpdateBoardingPayload = {
      title: title.trim(),
      description: description.trim(),
      boardingType: type,
      genderPref: gender,
      monthlyRent: parseInt(rent, 10),
      maxOccupants: parseInt(maxOccupants, 10),
    };

    setIsSaving(true);
    try {
      const result = await updateBoarding(boarding.id, payload);
      const updatedId = result.data.boarding.id;
      if (isLocked) {
        await submitBoardingForApproval(updatedId);
        Alert.alert(
          'Resubmitted',
          'Your changes have been saved and the listing has been submitted for re-review.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else {
        Alert.alert('Saved', 'Changes saved successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: unknown) {
      const data = (err as ApiError)?.response?.data;
      const message =
        data?.details?.map((d) => d.message).join('\n') ??
        data?.message ??
        'Failed to save. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (isLocked) {
      Alert.alert(
        'Editing Active Listing',
        'Saving changes will temporarily deactivate this listing for re-review. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: doSave },
        ],
      );
      return;
    }
    doSave();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLocked && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={18} color={COLORS.orange} />
          <Text style={styles.warningText}>Editing will temporarily deactivate this listing</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Boarding Type</Text>
        <View style={styles.chipRow}>
          {BOARDING_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, type === t.value && styles.chipActive]}
              onPress={() => setType(t.value)}
            >
              <Text style={[styles.chipText, type === t.value && styles.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Gender Preference</Text>
        <View style={styles.chipRow}>
          {GENDER_OPTIONS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.chip, gender === g.value && styles.chipActive]}
              onPress={() => setGender(g.value)}
            >
              <Text style={[styles.chipText, gender === g.value && styles.chipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Max Occupants</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setMaxOccupants((v) => String(Math.max(1, parseInt(v, 10) - 1)))}
          >
            <Ionicons name="remove" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{maxOccupants}</Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setMaxOccupants((v) => String(parseInt(v, 10) + 1))}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Monthly Rent (LKR)</Text>
        <TextInput
          style={styles.input}
          value={rent}
          onChangeText={setRent}
          keyboardType="number-pad"
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>{isLocked ? 'Save & Resubmit' : 'Save Changes'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingIndicator: { flex: 1, alignSelf: 'center' },
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  warningText: { fontSize: 13, color: COLORS.orange, fontWeight: '500', flex: 1 },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  textarea: { minHeight: 90, paddingTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    backgroundColor: COLORS.white,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: '#EBF0FF' },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  chipTextActive: { color: COLORS.primary, fontWeight: '700' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 18, fontWeight: '700', color: COLORS.text, minWidth: 30, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  saveBtnDisabled: { opacity: 0.7 },
});
