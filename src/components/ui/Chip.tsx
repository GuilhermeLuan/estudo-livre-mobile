import { Pressable } from 'react-native';

import { cores, espaco, raio } from '@/constants/tema';
import { Texto } from './Texto';

type Props = {
  texto: string;
  selecionado?: boolean;
  onPress?: () => void;
};

export function Chip({ texto, selecionado = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      onPress={onPress}
      style={{
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: raio.control,
        paddingHorizontal: espaco[12],
        paddingVertical: 6,
        backgroundColor: selecionado ? cores.accentSoft : cores.surface,
        borderColor: selecionado ? cores.accent : cores.line,
      }}
    >
      <Texto estilo="lista14Medio" cor={selecionado ? cores.accentInk : cores.ink2}>
        {texto}
      </Texto>
    </Pressable>
  );
}
