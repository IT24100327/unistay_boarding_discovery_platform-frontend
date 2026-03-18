import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SAMPLE_BOARDINGS } from '@/store/boarding.store';
import { COLORS } from '@/lib/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GalleryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const boarding = SAMPLE_BOARDINGS.find((b) => b.slug === slug || b.id === slug) ?? SAMPLE_BOARDINGS[0];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.counter}>{activeIndex + 1} / {boarding.images.length}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="share-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {boarding.images.length > 0 ? (
        <FlatList
          data={boarding.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(img) => img.id}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveIndex(idx);
          }}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image
                source={{ uri: item.url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          )}
        />
      ) : (
        <View style={styles.slide}>
          <Ionicons name="image-outline" size={80} color={COLORS.gray} />
          <Text style={styles.noImagesText}>No images available</Text>
        </View>
      )}

      {/* Thumbnail strip */}
      {boarding.images.length > 1 && (
        <FlatList
          data={boarding.images}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnails}
          keyExtractor={(img) => img.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.thumbnail, index === activeIndex && styles.thumbnailActive]}
              onPress={() => setActiveIndex(index)}
            >
              <Image source={{ uri: item.url }} style={styles.thumbnailImage} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 220 },
  noImagesText: { color: COLORS.gray, fontSize: 16, marginTop: 12 },
  thumbnails: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: { borderColor: COLORS.primary },
  thumbnailImage: { width: '100%', height: '100%' },
});
