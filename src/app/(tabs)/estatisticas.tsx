import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Icone } from '@/components/ui/Icone';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco, raio } from '@/constants/tema';
import { listarCiclos, listarEtapas, listarRegistros } from '@/services/database';
import type { Ciclo, Etapa, Registro } from '@/types/banco';
import { formatarDataISO } from '@/utils/data';
import { calcularEstatisticas, type HorasDaSemana } from '@/utils/estatisticas';

type Dados = {
  ciclos: Ciclo[];
  etapas: Etapa[];
  registros: Registro[];
  agora: string;
};

function formatarHoras(minutos: number): string {
  const total = Math.round(minutos);
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`;
}

function dataDaSemana(inicio: string): string {
  const [, mes, dia] = inicio.split('-');
  return `${Number(dia)}/${Number(mes)}`;
}

function CabecalhoCard({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  return (
    <View style={estilos.cabecalhoCard}>
      <Texto estilo="tituloH2">{titulo}</Texto>
      <Texto estilo="meta13" cor={cores.ink2}>{subtitulo}</Texto>
    </View>
  );
}

function LinhaEstatistica({
  materia,
  valor,
  proporcao,
  detalhe,
  baixo = false,
}: {
  materia: string;
  valor: string;
  proporcao: number;
  detalhe?: string;
  baixo?: boolean;
}) {
  const largura = `${Math.round(Math.max(0, Math.min(proporcao, 1)) * 100)}%` as `${number}%`;
  return (
    <View style={estilos.linhaEstatistica}>
      <View style={estilos.topoLinha}>
        <View style={estilos.nomeMateria}>
          <Texto estilo="lista14">{materia}</Texto>
          {detalhe ? <Texto estilo="meta12" cor={cores.ink2}>{detalhe}</Texto> : null}
        </View>
        <Texto estilo="lista14Forte" cor={baixo ? cores.red : cores.ink}>{valor}</Texto>
      </View>
      <View style={estilos.trilho}>
        <View style={[estilos.preenchimento, { width: largura, backgroundColor: baixo ? cores.red : cores.accent }]} />
      </View>
    </View>
  );
}

function BarrasSemanais({ semanas, largura }: { semanas: HorasDaSemana[]; largura: number }) {
  const maior = Math.max(1, ...semanas.map((semana) => semana.minutos));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[estilos.grafico, { width: largura }]}>
        {semanas.map((semana) => (
          <View key={semana.inicio} style={estilos.colunaSemana}>
            <Texto estilo="pilula11" style={estilos.rotuloGrafico}>
              {formatarHoras(semana.minutos)}
            </Texto>
            <View
              style={[
                estilos.barraSemana,
                {
                  height: semana.minutos === 0 ? 0 : (semana.minutos / maior) * 130,
                  backgroundColor: semana.esta ? cores.accent : cores.accentSoft,
                },
              ]}
            />
            <Texto estilo="meta12" cor={cores.ink2} style={estilos.rotuloGrafico}>
              {semana.esta ? 'esta' : dataDaSemana(semana.inicio)}
            </Texto>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function Estatisticas() {
  const db = useSQLiteContext();
  const { width } = useWindowDimensions();
  const [dados, setDados] = useState<Dados | null>(null);
  const [cicloId, setCicloId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const [ciclos, registros] = await Promise.all([listarCiclos(db), listarRegistros(db)]);
          const etapas = (await Promise.all(ciclos.map((ciclo) => listarEtapas(db, ciclo.id)))).flat();
          if (!ativo) return;
          setDados({ ciclos, registros, etapas, agora: formatarDataISO(new Date()) });
          setCicloId((id) => id === null || ciclos.some((ciclo) => ciclo.id === id) ? id : null);
          setErro(null);
        } catch {
          if (ativo) setErro('Não foi possível carregar as estatísticas.');
        }
      })();
      return () => { ativo = false; };
    }, [db]),
  );

  const estatisticas = useMemo(
    () => dados ? calcularEstatisticas({
      agora: dados.agora,
      registros: dados.registros,
      etapas: dados.etapas,
      cicloId,
    }) : null,
    [dados, cicloId],
  );

  const ciclo = dados?.ciclos.find((item) => item.id === cicloId);
  const registrosDoFiltro = dados?.registros.filter((item) => cicloId === null || item.cicloId === cicloId) ?? [];
  const mostrarFiltros = (dados?.registros.length ?? 0) > 0;
  const materias = estatisticas?.materias ?? [];
  const acertos = [...materias].sort((a, b) =>
    (b.taxaAcerto ?? -1) - (a.taxaAcerto ?? -1) || a.materia.localeCompare(b.materia, 'pt-BR'),
  );
  const horas = [...materias].sort((a, b) =>
    b.minutos - a.minutos || a.materia.localeCompare(b.materia, 'pt-BR'),
  );
  const maiorCarga = Math.max(1, ...horas.map((item) => item.minutos));
  const totalQuestoes = materias.reduce((soma, item) => soma + item.questoes, 0);

  const metas = new Map<string, number>();
  const minutosDaVolta = new Map<string, number>();
  if (dados) {
    const voltas = new Map(dados.ciclos.map((item) => [item.id, item.voltaAtual]));
    for (const etapa of dados.etapas) {
      if (cicloId !== null && etapa.cicloId !== cicloId) continue;
      metas.set(etapa.chaveMateria, (metas.get(etapa.chaveMateria) ?? 0) + etapa.minutos);
    }
    for (const registro of registrosDoFiltro) {
      if (registro.volta !== voltas.get(registro.cicloId)) continue;
      minutosDaVolta.set(
        registro.chaveMateria,
        (minutosDaVolta.get(registro.chaveMateria) ?? 0) + registro.minutos,
      );
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View>
        <Texto estilo="tituloH1">Estatísticas</Texto>
        <Texto estilo="lista14" cor={cores.ink2}>{ciclo?.nome ?? 'Todos os ciclos'}</Texto>
      </View>

      {mostrarFiltros ? (
        <View style={estilos.filtros}>
          <Chip texto="Todos" selecionado={cicloId === null} onPress={() => setCicloId(null)} />
          {dados?.ciclos.map((item) => (
            <View key={item.id} style={estilos.limiteChip}>
              <Chip
                texto={item.nome}
                selecionado={cicloId === item.id}
                onPress={() => setCicloId(item.id)}
              />
            </View>
          ))}
        </View>
      ) : null}

      {erro ? <Texto estilo="meta13" cor={cores.red}>{erro}</Texto> : null}

      {dados && !erro && registrosDoFiltro.length === 0 ? (
        <View style={estilos.vazio}>
          <View style={estilos.iconeVazio}><Icone nome="estatisticas" cor={cores.ink2} /></View>
          <Texto estilo="tituloH2" style={estilos.centro}>Sem estudos registrados</Texto>
          <Texto estilo="lista14" cor={cores.ink2} style={estilos.centro}>
            As estatísticas aparecem depois do primeiro registro de estudo.
          </Texto>
          <View style={estilos.espacoAcaoVazia} />
        </View>
      ) : null}

      {dados && !erro && registrosDoFiltro.length > 0 && estatisticas ? (
        <>
          <View style={estilos.card}>
            <CabecalhoCard
              titulo="Horas por semana"
              subtitulo={`média ${formatarHoras(estatisticas.mediaSemanalMinutos)}, últimas 8 semanas`}
            />
            <BarrasSemanais semanas={estatisticas.semanas} largura={Math.max(313, width - 62)} />
          </View>

          <View style={estilos.card}>
            <CabecalhoCard
              titulo="Acerto por matéria"
              subtitulo={`${totalQuestoes} questões, todas as voltas`}
            />
            <View style={estilos.lista}>
              {acertos.map((item) => (
                <LinhaEstatistica
                  key={item.chaveMateria}
                  materia={item.materia}
                  valor={item.taxaAcerto === null ? 'sem dados' : `${Math.round(item.taxaAcerto * 100)}%`}
                  proporcao={item.taxaAcerto ?? 0}
                  baixo={item.taxaAcerto !== null && item.taxaAcerto < 0.6}
                />
              ))}
            </View>
          </View>

          <View style={estilos.card}>
            <CabecalhoCard titulo="Horas por matéria" subtitulo="todas as voltas" />
            <View style={estilos.lista}>
              {horas.map((item) => {
                const meta = metas.get(item.chaveMateria);
                const extra = meta ? Math.max(0, (minutosDaVolta.get(item.chaveMateria) ?? 0) - meta) : 0;
                const detalhe = meta
                  ? `meta ${formatarHoras(meta)} por volta${extra > 0 ? `, +${formatarHoras(extra)} extra nesta volta` : ''}`
                  : undefined;
                return (
                  <LinhaEstatistica
                    key={item.chaveMateria}
                    materia={item.materia}
                    valor={formatarHoras(item.minutos)}
                    detalhe={detalhe}
                    proporcao={item.minutos / maiorCarga}
                  />
                );
              })}
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.paper },
  conteudo: { gap: espaco[20], paddingHorizontal: espaco[16], paddingTop: espaco[20], paddingBottom: 120 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco[6] },
  limiteChip: { maxWidth: '100%' },
  card: {
    gap: espaco[10], padding: espaco[14], backgroundColor: cores.surface,
    borderWidth: 1, borderColor: cores.line, borderRadius: raio.lg,
  },
  cabecalhoCard: { flexDirection: 'row', flexWrap: 'wrap', columnGap: espaco[8], rowGap: 2 },
  grafico: { height: 200, paddingTop: espaco[12], flexDirection: 'row', alignItems: 'flex-end', gap: espaco[4] },
  colunaSemana: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: espaco[6], minWidth: 0 },
  rotuloGrafico: { textAlign: 'center' },
  barraSemana: { width: '100%', maxWidth: 36, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  lista: { gap: espaco[12] },
  linhaEstatistica: { gap: espaco[4] },
  topoLinha: { flexDirection: 'row', alignItems: 'flex-end', gap: espaco[12] },
  nomeMateria: { flex: 1, minWidth: 0 },
  trilho: { width: '100%', height: 6, backgroundColor: cores.line, borderRadius: 3, overflow: 'hidden' },
  preenchimento: { height: '100%', borderRadius: 3 },
  vazio: {
    alignItems: 'center', gap: espaco[12], padding: espaco[24],
    backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.line, borderRadius: raio.lg,
  },
  iconeVazio: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.accentSoft },
  centro: { alignSelf: 'stretch', textAlign: 'center' },
  espacoAcaoVazia: { height: 38 },
});