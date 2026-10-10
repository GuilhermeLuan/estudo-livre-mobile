export type TipoEstudo = 'teoria' | 'exercicios' | 'revisao' | 'videoaula' | 'leitura_lei';

export type Ciclo = {
  id: number;
  nome: string;
  ativo: boolean;
  voltaAtual: number;
  /** Timestamp em ms. */
  criadoEm: number;
};

export type Etapa = {
  id: number;
  cicloId: number;
  posicao: number;
  materia: string;
  chaveMateria: string;
  minutos: number;
};

export type Registro = {
  id: number;
  cicloId: number;
  volta: number;
  chaveMateria: string;
  conteudo: string | null;
  /** Data do estudo no formato AAAA-MM-DD. */
  data: string;
  minutos: number;
  tipo: TipoEstudo | null;
  questoes: number | null;
  acertos: number | null;
  anotacao: string | null;
  /** Timestamp em ms. */
  criadoEm: number;
};

/** Sessão do cronômetro. O tempo decorrido é sempre calculado a partir destes horários. */
export type SessaoCronometro = {
  cicloId: number;
  /** Timestamp (ms) do início. */
  iniciadoEm: number;
  /** Milissegundos acumulados antes da pausa atual. */
  acumuladoMs: number;
  /** Timestamp (ms) da pausa; null quando está rodando. */
  pausadoEm: number | null;
};
