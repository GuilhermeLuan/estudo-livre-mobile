import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, raio } from '@/constants/tema';
import { Icone, type NomeIcone } from './ui/Icone';
import { Texto } from './ui/Texto';

const abas: Record<string, { rotulo: string; icone: NomeIcone }> = {
  index: { rotulo: 'Hoje', icone: 'hoje' },
  ciclos: { rotulo: 'Ciclos', icone: 'ciclos' },
  estatisticas: { rotulo: 'Estatísticas', icone: 'estatisticas' },
};

export function BarraInferior({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[estilos.barra, { paddingBottom: Math.max(bottom, 26) }]}>
      {state.routes.map((rota, indice) => {
        const aba = abas[rota.name];
        if (!aba) return null;
        const atual = state.index === indice;
        const cor = atual ? cores.accentInk : cores.ink2;
        const aoPressionar = () => {
          const evento = navigation.emit({ type: 'tabPress', target: rota.key, canPreventDefault: true });
          if (!atual && !evento.defaultPrevented) navigation.navigate(rota.name, rota.params);
        };
        return (
          <Pressable
            key={rota.key}
            accessibilityRole="tab"
            accessibilityLabel={aba.rotulo}
            accessibilityState={{ selected: atual }}
            onPress={aoPressionar}
            style={[estilos.link, atual && estilos.linkAtual]}
          >
            <Icone nome={aba.icone} cor={cor} />
            <Texto estilo="rotulo11" cor={cor}>
              {aba.rotulo}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingHorizontal: 40,
    backgroundColor: cores.surface,
    borderTopWidth: 1,
    borderTopColor: cores.line,
  },
  link: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: raio.control,
  },
  linkAtual: { backgroundColor: cores.accentSoft },
});
