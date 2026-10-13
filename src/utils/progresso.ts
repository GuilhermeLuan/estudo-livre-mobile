import type { Etapa, Registro } from '../types/banco';
import { normalizarMateria } from './normalizar';

export type ProgressoEtapa = Etapa & {
  minutosFeitos: number;
  minutosFaltantes: number;
  minutosExtras: number;
  concluida: boolean;
};

export type ProgressoMateria = {
  chaveMateria: string;
  materia: string;
  minutosFeitos: number;
  minutosPlanejados: number;
  minutosExtras: number;
};

export type EntradaProgressoVolta = {
  cicloId: number;
  volta: number;
  etapas: readonly Etapa[];
  registros: readonly Registro[];
  /** Instante da consulta, em milissegundos desde 1970. */
  agora: number;
};

export type ProgressoVolta = {
  /** O instante recebido do chamador; nenhuma função deste módulo lê o relógio. */
  calculadoEm: number;
  etapas: ProgressoEtapa[];
  materias: ProgressoMateria[];
  proximaEtapa: ProgressoEtapa | null;
  minutosPlanejados: number;
  minutosRegistrados: number;
  minutosFaltantes: number;
  minutosExtras: number;
  etapasConcluidas: number;
  voltaFechada: boolean;
};

/** Calcula o progresso sem consultar React, SQLite ou o relógio do aparelho. */
export function calcularProgressoVolta({
  cicloId,
  volta,
  etapas,
  registros,
  agora,
}: EntradaProgressoVolta): ProgressoVolta {
  const etapasDoCiclo = etapas
    .filter((etapa) => etapa.cicloId === cicloId)
    .sort((a, b) => a.posicao - b.posicao || a.id - b.id);

  const registrosDaVolta = registros.filter(
    (registro) => registro.cicloId === cicloId && registro.volta === volta,
  );

  const feitosPorMateria = new Map<string, number>();
  for (const registro of registrosDaVolta) {
    const chave = normalizarMateria(registro.chaveMateria);
    if (!chave) continue;
    feitosPorMateria.set(
      chave,
      (feitosPorMateria.get(chave) ?? 0) + registro.minutos,
    );
  }

  const ultimaPosicaoPorMateria = new Map<string, number>();
  etapasDoCiclo.forEach((etapa, indice) => {
    const chave = normalizarMateria(etapa.chaveMateria);
    ultimaPosicaoPorMateria.set(chave, indice);
  });

  const restantesPorMateria = new Map(feitosPorMateria);
  const materiasPorChave = new Map<string, ProgressoMateria>();

  const etapasComProgresso = etapasDoCiclo.map((etapa, indice): ProgressoEtapa => {
    const chave = normalizarMateria(etapa.chaveMateria);
    const disponivel = restantesPorMateria.get(chave) ?? 0;
    const minutosFeitos = Math.min(etapa.minutos, disponivel);
    const restante = disponivel - minutosFeitos;
    const minutosFaltantes = etapa.minutos - minutosFeitos;
    const minutosExtras =
      ultimaPosicaoPorMateria.get(chave) === indice ? restante : 0;

    restantesPorMateria.set(chave, restante);

    const resumo = materiasPorChave.get(chave);
    if (resumo) {
      resumo.minutosPlanejados += etapa.minutos;
      resumo.minutosExtras += minutosExtras;
    } else {
      materiasPorChave.set(chave, {
        chaveMateria: chave,
        materia: etapa.materia,
        minutosFeitos: feitosPorMateria.get(chave) ?? 0,
        minutosPlanejados: etapa.minutos,
        minutosExtras,
      });
    }

    return {
      ...etapa,
      minutosFeitos,
      minutosFaltantes,
      minutosExtras,
      concluida: minutosFaltantes === 0,
    };
  });

  const minutosFaltantes = etapasComProgresso.reduce(
    (total, etapa) => total + etapa.minutosFaltantes,
    0,
  );
  const etapasConcluidas = etapasComProgresso.filter(
    (etapa) => etapa.concluida,
  ).length;

  return {
    calculadoEm: agora,
    etapas: etapasComProgresso,
    materias: [...materiasPorChave.values()],
    proximaEtapa: etapasComProgresso.find((etapa) => !etapa.concluida) ?? null,
    minutosPlanejados: etapasDoCiclo.reduce(
      (total, etapa) => total + etapa.minutos,
      0,
    ),
    minutosRegistrados: registrosDaVolta.reduce(
      (total, registro) => total + registro.minutos,
      0,
    ),
    minutosFaltantes,
    minutosExtras: etapasComProgresso.reduce(
      (total, etapa) => total + etapa.minutosExtras,
      0,
    ),
    etapasConcluidas,
    voltaFechada:
      etapasComProgresso.length > 0 &&
      etapasConcluidas === etapasComProgresso.length,
  };
}
