import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/constants';

interface BoardingItem {
  id: string;
  name: string;
  location: string;
  price: string;
  rooms: number;
}

const SAMPLE_DATA: BoardingItem[] = [
  { id: '1', name: 'The Hub Residences', location: 'Colombo 07', price: 'LKR 15,000/mo', rooms: 3 },
  { id: '2', name: 'UniNest', location: 'Moratuwa', price: 'LKR 12,000/mo', rooms: 5 },
  { id: '3', name: 'Campus Lofts', location: 'Kandy', price: 'LKR 10,000/mo', rooms: 8 },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const filtered = SAMPLE_DATA.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.location.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem: ListRenderItem<BoardingItem> = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardIcon}>
        <Ionicons name="home" size={28} color={COLORS.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardLocation}>
          <Ionicons name="location-outline" size={12} color={COLORS.gray} /> {item.location}
        </Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
      </View>
      <View style={styles.roomsBadge}>
        <Text style={styles.roomsText}>{item.rooms} rooms</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Boardings</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          placeholderTextColor={COLORS.grayBorder}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EBF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  cardLocation: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  roomsBadge: {
    backgroundColor: '#EBF0FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roomsText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
});
