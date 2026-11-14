import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_600SemiBold } from '@expo-google-fonts/geist-mono';
import { useFonts } from 'expo-font';
import { router, Stack, useRootNavigationState } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { ToastHost } from '@/components/ui/ToastHost';
import { cores } from '@/constants/tema';
import { NOME_BANCO, migrarBanco } from '@/services/database';
import { prepararNotificacoes } from '@/services/lembretes';

SplashScreen.preventAutoHideAsync();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

/** Abre a tela indicada na notificação tocada; só navega depois que o roteador está montado. */
function ObservadorNotificacoes() {
  const pronto = Boolean(useRootNavigationState()?.key);
  const resposta = Notifications.useLastNotificationResponse();
  const tratada = useRef<string | null>(null);

  useEffect(() => {
    if (!pronto || !resposta || resposta.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const chave = `${resposta.notification.request.identifier}:${resposta.notification.date}`;
    if (tratada.current === chave) return;
    tratada.current = chave;
    const url = resposta.notification.request.content.data?.url;
    if (typeof url !== 'string') return;
    try {
      router.push(url as never);
    } catch {
      // Destino inválido não pode derrubar o app.
    }
  }, [pronto, resposta]);

  return null;
}

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

  useEffect(() => {
    if (Platform.OS === 'web') return;
    prepararNotificacoes().catch(() => undefined);
  }, []);

  if (!carregadas && !erro) return null;

  return (
    <SQLiteProvider databaseName={NOME_BANCO} onInit={migrarBanco}>
      <StatusBar style="light" />
      <ObservadorNotificacoes />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.paper } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lembretes" />
        <Stack.Screen
          name="registrar-estudo"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="registrar-sessao"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            gestureEnabled: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
      <ToastHost />
    </SQLiteProvider>
  );
}
