import type { Etapa, Registro } from '../types/banco';
import { normalizarMateria } from './normalizar';

const DIA_MS = 24 * 60 * 60 * 1000;

export type EntradaEstatisticas = {
  registros: readonly Registro[];
  //usadas apenas para mostrar o nome da matéria; os totais vêm dos registros. 
  etapas?: readonly Etapa[];
  //null ou ausência da propriedade significa "Todos os ciclos". 
  cicloId?: number | null;
  //Data local de hoje no formato AAAA-MM-DD, informada pelo chamador. 
  agora: string;
};

export type HorasDaSemana = {
  // Segunda-feira, inclusive, no formato AAAA-MM-DD. 
  inicio: string;
  // Domingo, inclusive, no formato AAAA-MM-DD. 
  fim: string;
  minutos: number;
  horas: number;
  /** true somente na semana que contém `agora`. */
  esta: boolean;
};

export type EstatisticaMateria = {
  chaveMateria: string;
  materia: string;
  /** Soma dos registros de todas as voltas no(s) ciclo(s) selecionado(s). */
  minutos: number;
  horas: number;
  questoes: number;
  acertos: number;
  /** Fração entre 0 e 1; null representa "sem dados". */
  taxaAcerto: number | null;
};

export type Estatisticas = {
  calculadoEm: string;
  /** Oito semanas, da mais antiga à atual. */
  semanas: HorasDaSemana[];
  /** Média das sete semanas fechadas, incluindo semanas vazias. */
  mediaSemanalMinutos: number;
  mediaSemanalHoras: number;
  /** Totais por matéria considerando todos os registros do filtro, não só oito semanas. */
  materias: EstatisticaMateria[];
};

/** Interpreta datas civis sem usar o fuso horário do dispositivo. */
function dataEmDias(data: string): number | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!partes) return null;

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const calendario = new Date(0);
  calendario.setUTCFullYear(ano, mes - 1, dia);
  calendario.setUTCHours(0, 0, 0, 0);

  if (
    calendario.getUTCFullYear() !== ano ||
    calendario.getUTCMonth() !== mes - 1 ||
    calendario.getUTCDate() !== dia
  ) {
    return null;
  }

  return Math.floor(calendario.getTime() / DIA_MS);
}

function dataDeDias(dias: number): string {
  const data = new Date(dias * DIA_MS);
  const ano = String(data.getUTCFullYear()).padStart(4, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(data.getUTCDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function ordenarChaves(a: EstatisticaMateria, b: EstatisticaMateria): number {
  return a.chaveMateria < b.chaveMateria ? -1 : a.chaveMateria > b.chaveMateria ? 1 : 0;
}

/** Calcula as estatísticas somente com os dados recebidos, sem React, SQLite ou relógio. */
export function calcularEstatisticas({
  registros,
  etapas = [],
  cicloId = null,
  agora,
}: EntradaEstatisticas): Estatisticas {
  const hoje = dataEmDias(agora);
  if (hoje === null) {
    throw new Error('agora deve estar no formato AAAA-MM-DD e ser uma data válida');
  }

  const diaDaSemana = new Date(hoje * DIA_MS).getUTCDay();
  const segundaAtual = hoje - ((diaDaSemana + 6) % 7);
  const primeiraSegunda = segundaAtual - 7 * 7;

  const semanas: HorasDaSemana[] = Array.from({ length: 8 }, (_, indice) => {
    const segunda = primeiraSegunda + indice * 7;
    return {
      inicio: dataDeDias(segunda),
      fim: dataDeDias(segunda + 6),
      minutos: 0,
      horas: 0,
      esta: indice === 7,
    };
  });

  const nomesPorChave = new Map<string, string>();
  const etapasDoFiltro = etapas
    .filter((etapa) => cicloId === null || etapa.cicloId === cicloId)
    .sort(
      (a, b) =>
        a.cicloId - b.cicloId || a.posicao - b.posicao || a.id - b.id,
    );

  for (const etapa of etapasDoFiltro) {
    const chave = normalizarMateria(etapa.chaveMateria);
    if (chave && !nomesPorChave.has(chave)) {
      nomesPorChave.set(chave, etapa.materia);
    }
  }

  const materiasPorChave = new Map<string, EstatisticaMateria>();
  for (const registro of registros) {
    if (cicloId !== null && registro.cicloId !== cicloId) continue;

    const data = dataEmDias(registro.data);
    if (data !== null && data >= primeiraSegunda && data <= hoje) {
      const indiceSemana = Math.floor((data - primeiraSegunda) / 7);
      semanas[indiceSemana].minutos += registro.minutos;
    }

    const chave = normalizarMateria(registro.chaveMateria);
    if (!chave) continue;

    let materia = materiasPorChave.get(chave);
    if (!materia) {
      materia = {
        chaveMateria: chave,
        materia: nomesPorChave.get(chave) ?? chave,
        minutos: 0,
        horas: 0,
        questoes: 0,
        acertos: 0,
        taxaAcerto: null,
      };
      materiasPorChave.set(chave, materia);
    }

    materia.minutos += registro.minutos;
    materia.questoes += registro.questoes ?? 0;
    materia.acertos += registro.acertos ?? 0;
  }

  for (const semana of semanas) {
    semana.horas = semana.minutos / 60;
  }

  const materias = [...materiasPorChave.values()].sort(ordenarChaves);
  for (const materia of materias) {
    materia.horas = materia.minutos / 60;
    materia.taxaAcerto =
      materia.questoes === 0 ? null : materia.acertos / materia.questoes;
  }

  const mediaSemanalMinutos =
    semanas.slice(0, 7).reduce((total, semana) => total + semana.minutos, 0) / 7;

  return {
    calculadoEm: agora,
    semanas,
    mediaSemanalMinutos,
    mediaSemanalHoras: mediaSemanalMinutos / 60,
    materias,
  };
}
