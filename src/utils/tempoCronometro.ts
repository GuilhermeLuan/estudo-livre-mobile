import type { SessaoCronometro } from '@/types/banco';

/** O relógio só soma tempo enquanto a sessão está em andamento. */
export function tempoDecorridoMs(sessao: SessaoCronometro, agora: number): number {
  return sessao.acumuladoMs + (sessao.pausadoEm === null ? Math.max(0, agora - sessao.iniciadoEm) : 0);
}

export function formatarCronometro(ms: number): string {
  const segundos = Math.floor(ms / 1000);
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(Math.floor(segundos / 3600))}:${dois(Math.floor(segundos / 60) % 60)}:${dois(segundos % 60)}`;
}

export function minutosArredondados(ms: number): number {
  return Math.round(ms / 60_000);
}
