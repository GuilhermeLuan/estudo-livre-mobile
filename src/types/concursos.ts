export type Concurso = {
  orgao: string;
  titulo: string;
  link: string;
  status: 'aberto' | 'previsto' | 'suspenso';
  vagas?: number | null;
  salario_max?: number | null;
  inscricao_fim?: string | null;
  publicado?: string | null;
  nacional?: boolean;
  ufs: string[];
};

export type DadosConcursos = {
  atualizado: string;
  ufs: Record<string, string>;
  concursos: Concurso[];
};

export type Situacao = 'aberto' | 'previsto' | 'todos';
