import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { cores } from '@/constants/tema';

/** Brilho azul suave atrás do Disco, medido no fundo de 341 × 285 do Figma e esticado ao tamanho real. */
export function BrilhoDisco() {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 341 285" preserveAspectRatio="none">
      <Defs>
        <RadialGradient id="brilho" gradientUnits="userSpaceOnUse" cx={146.14} cy={160.31} rx={121.8} ry={89.06}>
          <Stop offset={0} stopColor={cores.accent} stopOpacity={0.16} />
          <Stop offset={0.6} stopColor={cores.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={341} height={285} fill="url(#brilho)" />
    </Svg>
  );
}
