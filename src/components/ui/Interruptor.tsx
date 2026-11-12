import { Pressable, StyleSheet, View } from 'react-native';

import { cores } from '@/constants/tema';

type Props = { ligado: boolean; desabilitado?: boolean; onPress: () => void };

export function Interruptor({ ligado, desabilitado = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: ligado, disabled: desabilitado }}
      disabled={desabilitado}
      onPress={onPress}
      style={[estilos.trilho, ligado && estilos.ligado, desabilitado && estilos.desabilitado]}
    >
      <View style={[estilos.botao, ligado && estilos.botaoLigado]} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  trilho: { width: 44, height: 26, padding: 3, borderRadius: 13, backgroundColor: cores.surface2, borderWidth: 1, borderColor: cores.line },
  ligado: { backgroundColor: cores.accent, borderColor: cores.accent },
  botao: { width: 18, height: 18, borderRadius: 9, backgroundColor: cores.ink2 },
  botaoLigado: { alignSelf: 'flex-end', backgroundColor: cores.onAccent },
  desabilitado: { opacity: 0.4 },
});
