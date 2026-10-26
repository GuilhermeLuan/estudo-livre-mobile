import { StyleSheet, View } from 'react-native';

import { cores, espaco, padding, raio } from '@/constants/tema';
import { formatarHoras, type EstadoLinhaMateria } from '@/utils/hoje';
import type { ProgressoMateria } from '@/utils/progresso';
import { Barra } from './ui/Barra';
import { Pilula } from './ui/Pilula';
import { Texto } from './ui/Texto';

type Props = {
  materia: ProgressoMateria;
  estado: EstadoLinhaMateria;
};

/** Linha de matéria do Figma, nas variantes Padrão, Próxima e Concluída. */
export function LinhaMateria({ materia: { materia, minutosFeitos, minutosPlanejados, minutosExtras }, estado }: Props) {
  const concluida = estado === 'concluida';
  const feitos = Math.min(minutosFeitos, minutosPlanejados);
  return (
    <View style={estilos.linha}>
      <View style={estilos.topo}>
        <View style={estilos.nome}>
          <Texto estilo="lista14Medio" cor={concluida ? cores.ink2 : cores.ink} numberOfLines={1} style={estilos.texto}>
            {materia}
          </Texto>
          {estado === 'proxima' ? <Pilula texto="próxima" cor="azul" tamanho={11} /> : null}
        </View>
        <View style={estilos.tempo}>
          <Texto estilo="meta13" cor={cores.ink2}>{`${formatarHoras(feitos)} / ${formatarHoras(minutosPlanejados)}`}</Texto>
          {minutosExtras > 0 ? (
            <Texto estilo="meta13Forte" cor={cores.accentInk}>{`+${formatarHoras(minutosExtras)} extra`}</Texto>
          ) : null}
        </View>
      </View>
      <Barra progresso={minutosPlanejados === 0 ? 0 : feitos / minutosPlanejados} cor={concluida ? 'verde' : 'azul'} />
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { gap: espaco[4], paddingHorizontal: espaco[8], paddingVertical: padding.linhaMateria, borderRadius: raio.sm },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco[12] },
  nome: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: espaco[8] },
  texto: { flexShrink: 1 },
  tempo: { flexDirection: 'row', alignItems: 'center', gap: espaco[6] },
});
