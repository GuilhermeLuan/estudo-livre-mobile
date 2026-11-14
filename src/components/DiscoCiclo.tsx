import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { cores } from '@/constants/tema';
import type { ProgressoEtapa } from '@/utils/progresso';
import { calcularArcosDisco, caminhoArco } from '@/utils/hoje';
import { Texto } from './ui/Texto';

const TAMANHO = 240;
const CENTRO = TAMANHO / 2;
/** Raio do eixo dos arcos das etapas (largura 28) e do arco fino da próxima etapa, como no Figma. */
const RAIO = 92.3077;
const RAIO_PROXIMA = 111.7;
const LARGURA = 28;
const LARGURA_PROXIMA = 3;

type Props = {
  etapas: readonly ProgressoEtapa[];
  proximaEtapaId: number | null;
  volta: number;
  /** Texto grande do centro, ex.: "6h25". */
  falta: string;
};

/** Disco do ciclo: um arco por etapa, proporcional à carga; o arco fino externo marca a próxima. */
export function DiscoCiclo({ etapas, proximaEtapaId, volta, falta }: Props) {
  const arcos = calcularArcosDisco(etapas, proximaEtapaId);
  return (
    <View style={estilos.disco} accessibilityLabel={`Volta ${volta}, faltam ${falta} para fechar`}>
      <Svg width={TAMANHO} height={TAMANHO} viewBox={`0 0 ${TAMANHO} ${TAMANHO}`} fill="none">
        {arcos.length === 0 ? (
          <Path d={caminhoArco(CENTRO, RAIO, 0, 359.99)} stroke={cores.line} strokeWidth={LARGURA} />
        ) : null}
        {arcos.map((a) => (
          <Path key={`t${a.etapaId}`} d={caminhoArco(CENTRO, RAIO, a.inicio, a.fim)} stroke={cores.line} strokeWidth={LARGURA} />
        ))}
        {arcos
          .filter((a) => a.fimProgresso > a.inicio)
          .map((a) => (
            <Path
              key={`p${a.etapaId}`}
              d={caminhoArco(CENTRO, RAIO, a.inicio, a.fimProgresso)}
              stroke={cores.accent}
              strokeWidth={LARGURA}
            />
          ))}
        {arcos
          .filter((a) => a.proxima)
          .map((a) => (
            <Path
              key={`x${a.etapaId}`}
              d={caminhoArco(CENTRO, RAIO_PROXIMA, a.inicio, a.fim)}
              stroke={cores.ink}
              strokeWidth={LARGURA_PROXIMA}
              strokeLinecap="round"
            />
          ))}
      </Svg>
      <View style={estilos.centro} pointerEvents="none">
        <Texto estilo="lista14" cor={cores.ink2}>{`Volta ${volta}`}</Texto>
        <Texto estilo="discoFalta">{falta}</Texto>
        <Texto estilo="lista14" cor={cores.ink2}>
          para fechar
        </Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  disco: { width: TAMANHO, height: TAMANHO },
  centro: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
