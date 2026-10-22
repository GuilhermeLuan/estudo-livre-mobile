import type { Etapa, Registro } from '@/types/banco';

/**
 * Primeira etapa, na ordem do ciclo, que ainda não está cheia. As horas de cada matéria na volta
 * enchem as etapas dessa matéria em ordem. Devolve null se todas estiverem cheias.
 */
export function proximaEtapa(etapas: Etapa[], registrosDaVolta: Pick<Registro, 'chaveMateria' | 'minutos'>[]): Etapa | null {
  const restante = new Map<string, number>();
  for (const r of registrosDaVolta) {
    restante.set(r.chaveMateria, (restante.get(r.chaveMateria) ?? 0) + r.minutos);
  }
  for (const etapa of [...etapas].sort((a, b) => a.posicao - b.posicao)) {
    const sobra = restante.get(etapa.chaveMateria) ?? 0;
    if (sobra < etapa.minutos) return etapa;
    restante.set(etapa.chaveMateria, sobra - etapa.minutos);
  }
  return null;
}
