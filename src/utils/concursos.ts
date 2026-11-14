import type { Concurso, Situacao } from '../types/concursos';
import { dataEmDias } from './estatisticas';

/** Dias entre hoje e `fim` (AAAA-MM-DD, datas civis); null se alguma data for inválida. */
export function diasRestantes(fim: string, hoje: string): number | null {
  const a = dataEmDias(fim);
  const b = dataEmDias(hoje);
  return a === null || b === null ? null : a - b;
}

/** Esconde suspensos e encerrados, aplica os filtros e ordena (abertos por prazo, previstos do mais recente). */
export function filtrarConcursos(
  concursos: readonly Concurso[],
  situacao: Situacao,
  uf: string | null,
  hoje: string,
): Concurso[] {
  return concursos
    .filter((c) => {
      if (c.status === 'suspenso') return false;
      if (c.status === 'aberto' && c.inscricao_fim && c.inscricao_fim < hoje) return false;
      if (situacao !== 'todos' && c.status !== situacao) return false;
      return !uf || c.nacional || c.ufs.includes('br') || c.ufs.includes(uf);
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'aberto' ? -1 : 1;
      if (a.status === 'aberto') return (a.inscricao_fim ?? '9999').localeCompare(b.inscricao_fim ?? '9999');
      return (b.publicado ?? '').localeCompare(a.publicado ?? '');
    });
}
