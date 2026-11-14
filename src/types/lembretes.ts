export type DiaDaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ConfiguracaoLembretes = {
  lembreteDiarioAtivo: boolean;
  avisoCronometroAtivo: boolean;
  hora: number;
  minuto: number;
  dias: DiaDaSemana[];
  idsLembretes: string[];
  idAvisoCronometro: string | null;
};

export const CONFIGURACAO_LEMBRETES_PADRAO: ConfiguracaoLembretes = {
  lembreteDiarioAtivo: false,
  avisoCronometroAtivo: false,
  hora: 19,
  minuto: 30,
  dias: [2, 3, 4, 5, 6],
  idsLembretes: [],
  idAvisoCronometro: null,
};
