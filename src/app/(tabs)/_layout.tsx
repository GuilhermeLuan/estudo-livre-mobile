import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraInferior } from '@/components/BarraInferior';
import { Cabecalho } from '@/components/Cabecalho';
import { cores } from '@/constants/tema';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: cores.paper }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: cores.paper }}>
        <Cabecalho />
      </SafeAreaView>
      <Tabs
        tabBar={(props) => <BarraInferior {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: cores.paper } }}
      >
        <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
        <Tabs.Screen name="ciclos" options={{ title: 'Ciclos' }} />
        <Tabs.Screen name="estatisticas" options={{ title: 'Estatísticas' }} />
      </Tabs>
    </View>
  );
}
