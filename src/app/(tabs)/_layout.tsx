import { Tabs, useFocusEffect } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraInferior } from '@/components/BarraInferior';
import { Cabecalho } from '@/components/Cabecalho';
import { CronometroFlutuante } from '@/components/CronometroFlutuante';
import { cores } from '@/constants/tema';
import { carregarLembretes } from '@/services/lembretes';
import { useCronometro } from '@/store/cronometro';
import { useToast } from '@/store/toast';

function BarraComCronometro(props: BottomTabBarProps) {
  const [altura, setAltura] = useState(0);
  return (
    <View onLayout={(evento) => setAltura(evento.nativeEvent.layout.height)}>
      <BarraInferior {...props} />
      {altura > 0 ? <CronometroFlutuante distanciaInferior={altura - 5} /> : null}
    </View>
  );
}

export default function TabsLayout() {
  const db = useSQLiteContext();
  const hidratar = useCronometro((s) => s.hidratar);
  const mostrarToast = useToast((s) => s.mostrar);
  const [lembreteAtivo, setLembreteAtivo] = useState(false);
  useEffect(() => {
    hidratar(db).catch(() => mostrarToast('Não foi possível carregar o cronômetro.'));
  }, [db, hidratar, mostrarToast]);
  useFocusEffect(useCallback(() => {
    carregarLembretes(db).then((configuracao) => setLembreteAtivo(configuracao.lembreteDiarioAtivo)).catch(() => undefined);
  }, [db]));
  return (
    <View style={{ flex: 1, backgroundColor: cores.paper }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: cores.paper }}>
        <Cabecalho lembreteAtivo={lembreteAtivo} />
      </SafeAreaView>
      <Tabs
        tabBar={(props) => <BarraComCronometro {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: cores.paper } }}
      >
        <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
        <Tabs.Screen name="ciclos" options={{ title: 'Ciclos' }} />
        <Tabs.Screen name="estatisticas" options={{ title: 'Estatísticas' }} />
      </Tabs>
    </View>
  );
}
