import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { COLORS } from '@/lib/constants';

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>Hi, {user?.firstName ?? 'Alex'}! 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Current Residence Card */}
        <View style={styles.residenceCard}>
          <View style={styles.residenceHeader}>
            <Ionicons name="link" size={20} color={COLORS.white} />
            <Text style={styles.residenceLabel}>Current Residence</Text>
          </View>
          <View style={styles.residenceBody}>
            <Text style={styles.residenceName}>Room 302 - The Hub</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.paymentDue}>Next payment due in 5 days</Text>
        </View>

        {/* Upcoming Payments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>Rent for October</Text>
            <Text style={styles.paymentDueDate}>Due: Oct 05, 2023</Text>
          </View>
          <View>
            <Text style={styles.paymentAmount}>LKR 15,000</Text>
            <TouchableOpacity style={styles.payBtn}>
              <Text style={styles.payBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.paymentMethod}>🔒 Secure payment  Visa •••• 4242</Text>

        {/* Payment History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {[
          { name: 'Rent for September', amount: 'LKR 15,000' },
          { name: 'Amenities Fee', amount: 'LKR 2,500' },
        ].map((item) => (
          <View key={item.name} style={styles.historyItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
            <View style={styles.historyInfo}>
              <Text style={styles.historyName}>{item.name}</Text>
            </View>
            <Text style={styles.historyAmount}>{item.amount}</Text>
          </View>
        ))}

        {/* Marketplace */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Marketplace Items</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Manage</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketRow}>
          {[
            { name: 'Calculus 101', price: '$40', status: 'Pending' },
            { name: 'Mini Fridge', price: '$50', status: 'Live' },
          ].map((item) => (
            <View key={item.name} style={styles.marketCard}>
              <View style={styles.marketIcon}>
                <Ionicons name="cube-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.marketName}>{item.name}</Text>
              <Text style={styles.marketPrice}>{item.price}</Text>
              <Text
                style={[
                  styles.marketStatus,
                  item.status === 'Live' ? styles.marketStatusLive : styles.marketStatusPending,
                ]}
              >
                {item.status}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
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
  residenceCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    padding: 20,
    marginBottom: 24,
  },
  residenceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  residenceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  residenceBody: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  residenceName: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  activeBadge: { backgroundColor: COLORS.green, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  paymentDue: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  paymentCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentInfo: {},
  paymentName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  paymentDueDate: { fontSize: 12, color: COLORS.red, marginTop: 2 },
  paymentAmount: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'right' },
  payBtn: {
    marginTop: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  payBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  paymentMethod: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  historyInfo: { flex: 1 },
  historyName: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  historyAmount: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  marketRow: { paddingLeft: 20, marginBottom: 8 },
  marketCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  marketIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EBF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  marketName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  marketPrice: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  marketStatus: { fontSize: 11, fontWeight: '600' },
  marketStatusLive: { color: COLORS.green },
  marketStatusPending: { color: COLORS.orange },
});
