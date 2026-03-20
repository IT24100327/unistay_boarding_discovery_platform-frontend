import { Stack } from 'expo-router';

export default function MyListingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/analytics" />
      <Stack.Screen name="[id]/edit" />
    </Stack>
  );
}
