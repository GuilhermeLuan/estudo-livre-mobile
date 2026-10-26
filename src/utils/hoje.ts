import { normalizarMateria } from './normalizar';
import type { ProgressoEtapa, ProgressoMateria, ProgressoVolta } from './progresso';

const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "Quinta-feira, 1 de outubro". */
export function formatarDataExtensa(d: Date): string {
  const dia = DIAS[d.getDay()];
  return `${dia[0].toUpperCase()}${dia.slice(1)}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** Duração como "10h", "1h30" ou "45min"; zero vira "0h" (como nas linhas de matéria do Figma). */
export function formatarHoras(minutos: number): string {
  if (minutos === 0) return '0h';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** Duas primeiras letras do nome, em maiúsculas, para o avatar do card compacto. */
export function iniciaisDoCiclo(nome: string): string {
  return nome.trim().replace(/\s+/g, '').slice(0, 2).toUpperCase();
}

/** Porcentagem (0 a 100) da volta já cumprida; as horas extras não passam do planejado. */
export function porcentagemDaVolta(progresso: Pick<ProgressoVolta, 'minutosPlanejados' | 'minutosFaltantes'>): number {
  if (progresso.minutosPlanejados === 0) return 0;
  return Math.round(((progresso.minutosPlanejados - progresso.minutosFaltantes) / progresso.minutosPlanejados) * 100);
}

export type ArcoDisco = {
  etapaId: number;
  /** Graus a partir do topo, no sentido horário. */
  inicio: number;
  fim: number;
  /** Fim do trecho preenchido, entre inicio e fim. */
  fimProgresso: number;
  proxima: boolean;
};

const FOLGA_GRAUS = 2.3;

/**
 * Um arco por etapa, proporcional à carga horária, separados por uma folga fixa. O trecho
 * preenchido segue o progresso da etapa.
 */
export function calcularArcosDisco(etapas: readonly ProgressoEtapa[], proximaEtapaId: number | null): ArcoDisco[] {
  const total = etapas.reduce((soma, e) => soma + e.minutos, 0);
  if (total === 0) return [];
  const util = 360 - etapas.length * FOLGA_GRAUS;
  let acumulado = 0;
  return etapas.map((e, i) => {
    const inicio = (acumulado / total) * util + i * FOLGA_GRAUS;
    acumulado += e.minutos;
    const fim = (acumulado / total) * util + i * FOLGA_GRAUS;
    return {
      etapaId: e.id,
      inicio,
      fim,
      fimProgresso: e.minutos === 0 ? inicio : inicio + ((fim - inicio) * e.minutosFeitos) / e.minutos,
      proxima: e.id === proximaEtapaId,
    };
  });
}

export type EstadoLinhaMateria = 'padrao' | 'proxima' | 'concluida';

/** Concluída quando as horas da matéria cobrem a carga; Próxima quando é a matéria da próxima etapa. */
export function estadoDaMateria(
  materia: Pick<ProgressoMateria, 'chaveMateria' | 'minutosFeitos' | 'minutosPlanejados'>,
  proxima: Pick<ProgressoEtapa, 'chaveMateria'> | null,
): EstadoLinhaMateria {
  if (materia.minutosFeitos >= materia.minutosPlanejados) return 'concluida';
  if (proxima && normalizarMateria(proxima.chaveMateria) === materia.chaveMateria) return 'proxima';
  return 'padrao';
}

/** "1 etapa", "8 etapas". */
export function pluralizar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Caminho SVG (sentido horário) do arco de `inicio` a `fim` graus, a partir do topo, num círculo de centro (centro, centro). */
export function caminhoArco(centro: number, raioArco: number, inicio: number, fim: number): string {
  const ponto = (graus: number) => {
    const rad = (graus * Math.PI) / 180;
    return `${centro + raioArco * Math.sin(rad)} ${centro - raioArco * Math.cos(rad)}`;
  };
  return `M${ponto(inicio)}A${raioArco} ${raioArco} 0 ${fim - inicio > 180 ? 1 : 0} 1 ${ponto(fim)}`;
}
