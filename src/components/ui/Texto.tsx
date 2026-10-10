import { Text, type TextProps } from 'react-native';

import { cores, textos, type EstiloTexto } from '@/constants/tema';

type Props = TextProps & {
  estilo: EstiloTexto;
  cor?: string;
};

export function Texto({ estilo, cor = cores.ink, style, ...resto }: Props) {
  return <Text {...resto} style={[textos[estilo], { color: cor }, style]} />;
}
