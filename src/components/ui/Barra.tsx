import { View } from 'react-native';

import { cores, raio, tamanhos } from '@/constants/tema';

type Props = {
  /** Progresso de 0 a 1; acima de 1 a barra fica cheia. */
  progresso: number;
  cor?: 'azul' | 'verde';
};

const preenchimento = { azul: cores.accent, verde: cores.green } as const;

/** Barra do Figma: trilho --line de 5px com preenchimento proporcional. */
export function Barra({ progresso, cor = 'azul' }: Props) {
  const largura = `${Math.min(Math.max(progresso, 0), 1) * 100}%` as const;
  return (
    <View style={{ height: tamanhos.barra, borderRadius: raio.barra, overflow: 'hidden', backgroundColor: cores.line }}>
      <View style={{ width: largura, height: '100%', borderRadius: raio.barra, backgroundColor: preenchimento[cor] }} />
    </View>
  );
}
