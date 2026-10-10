import { StyleSheet, View } from 'react-native';

import { cores, raio, sombras } from '@/constants/tema';
import { Texto } from './Texto';

export function Toast({ mensagem }: { mensagem: string }) {
  return (
    <View accessibilityLiveRegion="polite" style={estilos.toast}>
      <Texto estilo="lista14Medio">{mensagem}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    maxWidth: 343,
    backgroundColor: cores.surface2,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...sombras.flutuante,
  },
});
