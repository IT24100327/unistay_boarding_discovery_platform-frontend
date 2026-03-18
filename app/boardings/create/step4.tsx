import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoardingStore } from '@/store/boarding.store';
import { COLORS } from '@/lib/constants';
import type { BoardingImage } from '@/types/boarding.types';

const MAX_IMAGES = 8;

// Sample placeholder images to simulate picked photos
const PLACEHOLDER_URLS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>Step {step} of {total}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / total) * 100}%` }]} />
      </View>
    </View>
  );
}

export default function CreateStep4Screen() {
  const { createDraft, setCreateDraft } = useBoardingStore();
  const [images, setImages] = useState<BoardingImage[]>(createDraft.images ?? []);

  const handleAddPhoto = () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }
    Alert.alert('Add Photo', 'In a real app this would open camera or gallery.', [
      {
        text: 'Use sample image',
        onPress: () => {
          const url = PLACEHOLDER_URLS[images.length % PLACEHOLDER_URLS.length];
          const newImage: BoardingImage = {
            id: `img-${Date.now()}`,
            url,
            publicId: '',
            createdAt: new Date().toISOString(),
          };
          setImages((prev) => [...prev, newImage]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id);
      if (idx <= 0) return prev;
      const reordered = [...prev];
      const [moved] = reordered.splice(idx, 1);
      reordered.unshift(moved);
      return reordered;
    });
  };

  const handleNext = () => {
    if (images.length === 0) {
      Alert.alert('Required', 'Please add at least 1 image.');
      return;
    }
    setCreateDraft({ images });
    router.push('/boardings/create/step5' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ProgressBar step={4} total={5} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.subtitle}>Add up to {MAX_IMAGES} photos. The first image will be the primary photo.</Text>

        <View style={styles.imageGrid}>
          {images.map((img, index) => (
            <View key={img.id} style={[styles.imageCell, index === 0 && styles.imageCellPrimary]}>
              <Image source={{ uri: img.url }} style={styles.cellImage} />
              {index === 0 && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(img.id)}
              >
                <Ionicons name="close-circle" size={22} color={COLORS.red} />
              </TouchableOpacity>
              {index !== 0 && (
                <TouchableOpacity
                  style={styles.setPrimaryBtn}
                  onPress={() => handleSetPrimary(img.id)}
                >
                  <Text style={styles.setPrimaryText}>Set Primary</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addCell} onPress={handleAddPhoto} activeOpacity={0.75}>
              <Ionicons name="add" size={32} color={COLORS.primary} />
              <Text style={styles.addCellText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {images.length === 0 && (
          <View style={styles.emptyHint}>
            <Ionicons name="images-outline" size={40} color={COLORS.grayBorder} />
            <Text style={styles.emptyHintText}>At least 1 image required</Text>
          </View>
        )}

        <Text style={styles.countLabel}>{images.length} / {MAX_IMAGES} photos added</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backFooterBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={COLORS.text} />
          <Text style={styles.backFooterBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  progressContainer: { padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grayBorder },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  progressTrack: { height: 4, backgroundColor: COLORS.grayLight, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  content: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageCell: {
    width: '47%',
    aspectRatio: 1.3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
  },
  imageCellPrimary: { borderColor: COLORS.primary, borderWidth: 2 },
  cellImage: { width: '100%', height: '100%' },
  primaryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  primaryBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  deleteBtn: { position: 'absolute', top: 6, right: 6 },
  setPrimaryBtn: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  setPrimaryText: { fontSize: 10, fontWeight: '600', color: COLORS.white },
  addCell: {
    width: '47%',
    aspectRatio: 1.3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.grayBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addCellText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  emptyHint: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyHintText: { fontSize: 13, color: COLORS.gray },
  countLabel: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayBorder,
  },
  backFooterBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backFooterBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  nextBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
