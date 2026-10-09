import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="registrar-estudo" options={{ presentation: 'modal' }} />
      <Stack.Screen name="registrar-sessao" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
