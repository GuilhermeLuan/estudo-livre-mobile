/**
 * Tokens do Figma "Estudo Livre": coleções Cores e Forma, estilos de texto e de efeito.
 * Único lugar onde cores, raios e espaçamentos são definidos.
 */
import type { TextStyle, ViewStyle } from 'react-native';

export const cores = {
  paper: '#0b0f19',
  surface: '#121826',
  surface2: '#182033',
  ink: '#f1f4f9',
  ink2: '#a7b0c0',
  line: '#222b3d',
  accent: '#2f6bff',
  accentInk: '#6e9bff',
  accentSoft: '#172447',
  green: '#34d27b',
  greenSoft: '#12301f',
  red: '#ff6b6b',
  redSoft: '#3a1a1f',
  onAccent: '#ffffff',
  focus: '#6e9bff',
  scrim: 'rgba(3, 6, 12, 0.7)',
} as const;

export const raio = {
  sm: 6,
  control: 8,
  md: 10,
  lg: 14,
} as const;

export const espaco = {
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  20: 20,
  24: 24,
} as const;

export const padding = {
  card: 18,
  hero: 22,
} as const;

export const fontes = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semiBold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  monoSemiBold: 'GeistMono_600SemiBold',
} as const;

function estilo(
  fontFamily: string,
  fontSize: number,
  lineHeightRatio: number,
  letterSpacingPercent = 0,
): TextStyle {
  return {
    fontFamily,
    fontSize,
    lineHeight: Math.round(fontSize * lineHeightRatio * 100) / 100,
    letterSpacing: (fontSize * letterSpacingPercent) / 100,
  };
}

/** Estilos de texto do Figma (mesmos nomes, sem acentos nas chaves). */
export const textos = {
  tituloH1: estilo(fontes.semiBold, 22, 1.2, -1.5),
  tituloH2: estilo(fontes.semiBold, 16, 1.2, -1.5),
  tituloDialogo: estilo(fontes.semiBold, 18, 1.2, -1.5),
  tituloDestaque: estilo(fontes.semiBold, 22, 1.2, -2),
  corpo15: estilo(fontes.regular, 15, 1.55),
  lista14: estilo(fontes.regular, 14, 1.45),
  lista14Medio: estilo(fontes.medium, 14, 1.45),
  lista14Forte: estilo(fontes.semiBold, 14, 1.45),
  meta13: estilo(fontes.regular, 13, 1.45),
  meta13Medio: estilo(fontes.medium, 13, 1.45),
  meta13Forte: estilo(fontes.semiBold, 13, 1.45),
  meta12: estilo(fontes.regular, 12, 1.4),
  pilula12: estilo(fontes.semiBold, 12, 1.4),
  pilula11: estilo(fontes.semiBold, 11, 1.4),
  rotulo11: estilo(fontes.medium, 11, 1.3),
  iniciais12: estilo(fontes.bold, 12, 1.2),
  metrica20: estilo(fontes.semiBold, 20, 1.2),
  marca17: estilo(fontes.bold, 17, 1.2, -2),
  cronometro24: estilo(fontes.monoSemiBold, 24, 1.2),
} as const;

export type EstiloTexto = keyof typeof textos;

/** Efeitos do Figma como sombras do React Native. */
export const sombras = {
  botaoPrimario: {
    shadowColor: cores.accent,
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  flutuante: {
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cronometro: {
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 20 },
    elevation: 16,
  },
} as const satisfies Record<string, ViewStyle>;
