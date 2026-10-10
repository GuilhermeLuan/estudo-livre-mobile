import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { cores, espaco, raio, sombras } from '@/constants/tema';
import { Texto } from './Texto';

export type VarianteBotao = 'primario' | 'secundario' | 'discreto' | 'perigo';
export type TamanhoBotao = 'padrao' | 'lista';

type Props = {
  rotulo: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

const corTexto: Record<VarianteBotao, string> = {
  primario: cores.onAccent,
  secundario: cores.ink,
  discreto: cores.accentInk,
  perigo: cores.red,
};

export function Botao({
  rotulo,
  onPress,
  variante = 'primario',
  tamanho = 'padrao',
  desabilitado = false,
  style,
}: Props) {
  const lista = tamanho === 'lista';
  const estiloTexto =
    variante === 'discreto'
      ? lista ? 'meta13Medio' : 'lista14Medio'
      : lista ? 'meta13Forte' : 'lista14Forte';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        { height: lista ? 32 : 38, paddingHorizontal: variante === 'discreto' ? espaco[4] : lista ? 12 : 16 },
        variante === 'primario' && estilos.primario,
        (variante === 'secundario' || variante === 'perigo') && estilos.secundario,
        desabilitado && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Texto estilo={estiloTexto} cor={corTexto[variante]}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco[8],
    borderRadius: raio.control,
  },
  primario: {
    backgroundColor: cores.accent,
    borderWidth: 1,
    borderColor: cores.accent,
    ...sombras.botaoPrimario,
  },
  secundario: {
    backgroundColor: cores.surface2,
    borderWidth: 1,
    borderColor: cores.line,
  },
});
