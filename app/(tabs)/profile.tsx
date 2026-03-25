import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { editProfileSchema } from '@/utils/validation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { COLORS, APP_VERSION } from '@/lib/constants';
import { getErrorMessage } from '@/utils/helpers';
import { useImagePicker } from '@/hooks/useImagePicker';
import { uploadProfileImage } from '@/lib/user';

type EditForm = z.infer<typeof editProfileSchema>;

interface MenuItem {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const { user, logout, updateProfile, refreshProfile, isLoading } = useAuthStore();
  const { pickImage } = useImagePicker();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editProfileSchema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      university: user?.university ?? '',
      nicNumber: user?.nicNumber ?? '',
    },
  });

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleChangePhoto = async () => {
    try {
      const uri = await pickImage();
      if (!uri) return;
      await uploadProfileImage(uri);
      await refreshProfile();
      Alert.alert('Success', 'Profile image updated!');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const onSubmitProfile = async (data: EditForm) => {
    try {
      await updateProfile(data);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const mainMenuItems: MenuItem[] = useMemo(
    () => [
      ...(user?.role === 'STUDENT'
        ? [
            {
              id: 'visits',
              label: 'My Visit Requests',
              sublabel: 'Scheduled property visits',
              icon: <Ionicons name="eye-outline" size={20} color={COLORS.primary} />,
              onPress: () => router.push('/visits' as never),
            },
            {
              id: 'reservations',
              label: 'My Reservations',
              sublabel: 'Current and past bookings',
              icon: <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />,
              onPress: () => router.push('/reservations' as never),
            },
          ]
        : []),
      ...(user?.role === 'OWNER'
        ? [
            {
              id: 'visit-requests',
              label: 'Visit Requests',
              sublabel: 'Review incoming visit requests',
              icon: <Ionicons name="eye-outline" size={20} color={COLORS.primary} />,
              onPress: () => router.push('/my-listings/visits' as never),
            },
            {
              id: 'reservation-applications',
              label: 'Reservation Applications',
              sublabel: 'Review incoming reservation requests',
              icon: <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />,
              onPress: () => router.push('/my-listings/reservations' as never),
            },
            {
              id: 'tenants',
              label: 'Active Tenants',
              sublabel: 'Manage current tenants',
              icon: <Ionicons name="people-outline" size={20} color={COLORS.primary} />,
              onPress: () => router.push('/my-listings/tenants' as never),
            },
            {
              id: 'payments',
              label: 'Tenant Payments',
              sublabel: 'Review, approve or reject payments',
              icon: <Ionicons name="cash-outline" size={20} color={COLORS.primary} />,
              onPress: () => router.push('/my-listings/payments' as never),
            },
            {
              id: 'payment-history',
              label: 'Payment History',
              sublabel: 'Confirmed payments & earnings summary',
              icon: <Ionicons name="time-outline" size={20} color={COLORS.primary} />,
              onPress: () => router.push('/my-listings/payment-history' as never),
            },
          ]
        : []),
      {
        id: 'saved',
        label: 'Saved Boardings',
        sublabel: 'Wishlist',
        icon: <Ionicons name="heart-outline" size={20} color="#EF4444" />,
        onPress: () => router.push('/saved'),
      },
      {
        id: 'marketplace',
        label: 'My Marketplace Items',
        sublabel: 'Items for sale',
        icon: <Ionicons name="grid-outline" size={20} color={COLORS.primary} />,
        onPress: () => {},
      },
    ],
    [user?.role]
  );

  const secondaryItems: MenuItem[] = [
    {
      id: 'change-password',
      label: 'Change Password',
      sublabel: 'Update your account password',
      icon: <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />,
      onPress: () => router.push('/profile/change-password'),
    },
    {
      id: 'settings',
      label: 'Settings',
      sublabel: 'App preferences, notifications',
      icon: <Ionicons name="settings-outline" size={20} color={COLORS.gray} />,
      onPress: () => router.push('/settings'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      sublabel: '',
      icon: <MaterialIcons name="logout" size={20} color={COLORS.red} />,
      onPress: handleLogout,
      danger: true,
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>{item.icon}</View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, item.danger && styles.dangerText]}>{item.label}</Text>
        {item.sublabel ? <Text style={styles.menuSublabel}>{item.sublabel}</Text> : null}
      </View>
      {!item.danger && <Ionicons name="chevron-forward" size={18} color={COLORS.grayBorder} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar
                uri={user?.profileImageUrl ?? user?.avatar}
                firstName={user?.firstName}
                lastName={user?.lastName}
                size={100}
              />
              <TouchableOpacity style={styles.cameraBtn} onPress={handleChangePhoto}>
                <Ionicons name="camera" size={14} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>
              {user?.firstName ?? 'User'} {user?.lastName ?? ''}
            </Text>
            <View style={styles.badgeRow}>
              <Badge label={user?.role === 'OWNER' ? 'Property Owner' : 'Student'} variant="primary" pill />
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>

            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="First Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="First Name"
                  error={errors.firstName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Last Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Last Name"
                  error={errors.lastName?.message}
                />
              )}
            />

            <Input
              label="Email Address"
              value={user?.email ?? ''}
              editable={false}
              placeholder="email@example.com"
              containerStyle={styles.disabledInput}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="07X XXX XXXX"
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />

            {user?.role === 'STUDENT' ? (
              <Controller
                control={control}
                name="university"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="University"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Your university"
                    error={errors.university?.message}
                  />
                )}
              />
            ) : (
              <Controller
                control={control}
                name="nicNumber"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="NIC Number"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter NIC number"
                    error={errors.nicNumber?.message}
                  />
                )}
              />
            )}

            <Button
              title="Save Changes"
              onPress={handleSubmit(onSubmitProfile)}
              loading={isLoading}
              style={styles.saveBtn}
            />
          </View>

          <View style={styles.menuCard}>{mainMenuItems.map(renderMenuItem)}</View>
          <View style={[styles.menuCard, styles.menuCardSecondary]}>{secondaryItems.map(renderMenuItem)}</View>

          <Text style={styles.version}>UniStay v{APP_VERSION}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.text },
  placeholder: { width: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  disabledInput: { opacity: 0.6 },
  saveBtn: { marginTop: 4 },
  menuCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  menuCardSecondary: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuSublabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  dangerText: { color: COLORS.red },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, marginBottom: 32 },
});
