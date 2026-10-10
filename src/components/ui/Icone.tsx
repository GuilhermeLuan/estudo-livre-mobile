import Svg, { Circle, G, Path } from 'react-native-svg';

import { cores } from '@/constants/tema';

export type NomeIcone =
  | 'hoje'
  | 'ciclos'
  | 'estatisticas'
  | 'usuarios'
  | 'fechar'
  | 'alca'
  | 'voltar'
  | 'setaAbaixo'
  | 'mais';

type Props = {
  nome: NomeIcone;
  cor?: string;
  tamanho?: number;
};

/** Ícones do Figma (grade de 20px), desenhados com a cor recebida. */
export function Icone({ nome, cor = cores.ink2, tamanho = 20 }: Props) {
  const traco = { stroke: cor, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      {nome === 'hoje' && <Path d="M3 9L10 3L17 9V17H3V9Z" strokeWidth={2} {...traco} strokeLinecap="butt" />}
      {nome === 'ciclos' && (
        <>
          <Circle cx={10} cy={10} r={7} stroke={cor} strokeWidth={2} />
          <Path d="M10 3V10L15 14" stroke={cor} strokeWidth={2} />
        </>
      )}
      {nome === 'estatisticas' && (
        <Path d="M4 16V9M10 16V4M16 16V11" strokeWidth={2.5} {...traco} />
      )}
      {nome === 'usuarios' && (
        <G x={3} y={3}>
          <Circle cx={7} cy={4} r={3} strokeWidth={2} {...traco} />
          <Path d="M1 14C1 11 4 9 7 9C10 9 13 11 13 14" strokeWidth={2} {...traco} />
        </G>
      )}
      {nome === 'fechar' && <Path d="M5 5L15 15M15 5L5 15" strokeWidth={2} {...traco} />}
      {nome === 'alca' && (
        <G fill={cor}>
          {[4.9, 11.9].flatMap((x) =>
            [2.4, 8.4, 14.4].map((y) => <Circle key={`${x}-${y}`} cx={x + 1.6} cy={y + 1.6} r={1.6} />),
          )}
        </G>
      )}
      {nome === 'voltar' && <Path d="M12 4L6 10L12 16" strokeWidth={2} {...traco} />}
      {nome === 'setaAbaixo' && <Path d="M6 8L10 12L14 8" strokeWidth={1.8} {...traco} />}
      {nome === 'mais' && <Path d="M10 4V16M4 10H16" strokeWidth={2} {...traco} />}
    </Svg>
  );
}
