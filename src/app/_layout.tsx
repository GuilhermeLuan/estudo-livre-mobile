import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_600SemiBold } from '@expo-google-fonts/geist-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { cores } from '@/constants/tema';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [carregadas, erro] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_600SemiBold,
  });

  useEffect(() => {
    if (carregadas || erro) SplashScreen.hideAsync();
  }, [carregadas, erro]);

  if (!carregadas && !erro) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.paper } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="registrar-estudo" options={{ presentation: 'modal' }} />
        <Stack.Screen name="registrar-sessao" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
