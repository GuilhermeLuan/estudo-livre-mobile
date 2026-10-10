import { View } from 'react-native';

import { cores, raio } from '@/constants/tema';
import { Texto } from './Texto';

export type CorPilula = 'neutra' | 'azul' | 'verde' | 'vermelha';

type Props = {
  texto: string;
  cor?: CorPilula;
  tamanho?: 12 | 11;
};

const paleta: Record<CorPilula, { fundo: string; texto: string }> = {
  neutra: { fundo: cores.surface2, texto: cores.ink2 },
  azul: { fundo: cores.accentSoft, texto: cores.accentInk },
  verde: { fundo: cores.greenSoft, texto: cores.green },
  vermelha: { fundo: cores.redSoft, texto: cores.red },
};

export function Pilula({ texto, cor = 'neutra', tamanho = 12 }: Props) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: paleta[cor].fundo,
        borderRadius: raio.sm,
        paddingHorizontal: tamanho === 12 ? 8 : 6,
        paddingVertical: tamanho === 12 ? 2 : 1,
      }}
    >
      <Texto estilo={tamanho === 12 ? 'pilula12' : 'pilula11'} cor={paleta[cor].texto}>
        {texto}
      </Texto>
    </View>
  );
}
