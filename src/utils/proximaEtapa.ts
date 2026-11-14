import type { Etapa, Registro } from '@/types/banco';

/**
 * Primeira etapa, na ordem do ciclo, que ainda não está cheia. As horas de cada matéria na volta
 * enchem as etapas dessa matéria em ordem. Devolve null se todas estiverem cheias.
 */
export function proximaEtapa(
  etapas: Etapa[],
  registrosDaVolta: Pick<Registro, 'chaveMateria' | 'minutos'>[],
): Etapa | null {
  const estudado = new Map<string, number>();
  for (const r of registrosDaVolta) {
    estudado.set(r.chaveMateria, (estudado.get(r.chaveMateria) ?? 0) + r.minutos);
  }
  for (const etapa of [...etapas].sort((a, b) => a.posicao - b.posicao)) {
    const disponivel = estudado.get(etapa.chaveMateria) ?? 0;
    if (disponivel < etapa.minutos) return etapa;
    estudado.set(etapa.chaveMateria, disponivel - etapa.minutos);
  }
  return null;
}

/** Matérias distintas do ciclo, na ordem em que aparecem nas etapas. */
export function materiasDoCiclo(etapas: Etapa[]): { chave: string; nome: string }[] {
  const vistas = new Map<string, string>();
  for (const e of etapas) if (!vistas.has(e.chaveMateria)) vistas.set(e.chaveMateria, e.materia);
  return [...vistas].map(([chave, nome]) => ({ chave, nome }));
}
