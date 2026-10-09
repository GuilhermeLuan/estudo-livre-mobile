import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="ciclos" options={{ title: 'Ciclos' }} />
      <Tabs.Screen name="estatisticas" options={{ title: 'Estatísticas' }} />
    </Tabs>
  );
}
