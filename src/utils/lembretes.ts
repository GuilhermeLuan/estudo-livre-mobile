import type { ConfiguracaoLembretes, DiaDaSemana } from '@/types/lembretes';
import { formatarHoras } from './hoje';

export type AgendamentoSemanal = { weekday: DiaDaSemana; hour: number; minute: number };

export type PlanoLembreteDiario = {
  // Ids já agendados que precisam ser cancelados antes de agendar de novo (evita duplicatas).
  cancelar: string[];
  agendar: AgendamentoSemanal[];
};

export function planejarLembreteDiario(configuracao: ConfiguracaoLembretes): PlanoLembreteDiario {
  const cancelar = [...configuracao.idsLembretes];
  if (!configuracao.lembreteDiarioAtivo) return { cancelar, agendar: [] };
  const dias = [...new Set(configuracao.dias)].sort();
  return {
    cancelar,
    agendar: dias.map((weekday) => ({ weekday, hour: configuracao.hora, minute: configuracao.minuto })),
  };
}

// `dias` segue o padrão do Expo: 1 = domingo ... 7 = sábado (diferente de Date.getDay()).
export function proximoDisparoDiario(agora: Date, hora: number, minuto: number, dias: readonly DiaDaSemana[]): Date | null {
  if (dias.length === 0) return null;
  for (let somaDias = 0; somaDias <= 7; somaDias += 1) {
    const candidata = new Date(agora);
    candidata.setDate(agora.getDate() + somaDias);
    candidata.setHours(hora, minuto, 0, 0);
    if (candidata.getTime() > agora.getTime() && dias.includes((candidata.getDay() + 1) as DiaDaSemana)) {
      return candidata;
    }
  }
  return null;
}

export type EtapaDoLembrete = { materia: string; minutosFeitos: number; minutos: number };

export function textoLembreteDiario(etapa: EtapaDoLembrete | null): { titulo: string; corpo: string } {
  return {
    titulo: 'Hora de estudar',
    corpo: etapa
      ? `Próxima etapa: ${etapa.materia} (${formatarHoras(etapa.minutosFeitos)} de ${formatarHoras(etapa.minutos)} nesta volta).`
      : 'Abra o Estudo Livre e continue sua próxima etapa.',
  };
}

export function textoAvisoCronometro(materia: string, minutosDaSessao: number): { titulo: string; corpo: string } {
  return {
    titulo: `Sua sessão passou de ${formatarHoras(minutosDaSessao)}`,
    corpo: `Toque para registrar o estudo de ${materia}.`,
  };
}

/** Momento do aviso do cronômetro: `null` quando o tempo da etapa já passou e o aviso deve sair na hora. */
export function dataDoAvisoCronometro(agora: number, restanteMs: number): Date | null {
  return restanteMs <= 0 ? null : new Date(agora + restanteMs);
}


