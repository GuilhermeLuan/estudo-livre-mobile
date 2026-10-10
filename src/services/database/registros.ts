import type { SQLiteDatabase } from 'expo-sqlite';

import type { Registro, TipoEstudo } from '@/types/banco';

type LinhaRegistro = {
  id: number;
  ciclo_id: number;
  volta: number;
  chave_materia: string;
  conteudo: string | null;
  data: string;
  minutos: number;
  tipo: TipoEstudo | null;
  questoes: number | null;
  acertos: number | null;
  anotacao: string | null;
  criado_em: number;
};

const paraRegistro = (l: LinhaRegistro): Registro => ({
  id: l.id,
  cicloId: l.ciclo_id,
  volta: l.volta,
  chaveMateria: l.chave_materia,
  conteudo: l.conteudo,
  data: l.data,
  minutos: l.minutos,
  tipo: l.tipo,
  questoes: l.questoes,
  acertos: l.acertos,
  anotacao: l.anotacao,
  criadoEm: l.criado_em,
});

export type NovoRegistro = Omit<Registro, 'id' | 'criadoEm'>;

export async function criarRegistro(db: SQLiteDatabase, r: NovoRegistro): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO registros
      (ciclo_id, volta, chave_materia, conteudo, data, minutos, tipo, questoes, acertos, anotacao, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    r.cicloId,
    r.volta,
    r.chaveMateria,
    r.conteudo,
    r.data,
    r.minutos,
    r.tipo,
    r.questoes,
    r.acertos,
    r.anotacao,
    Date.now(),
  );
  return res.lastInsertRowId;
}

export async function listarRegistrosDoCiclo(
  db: SQLiteDatabase,
  cicloId: number,
  volta?: number,
): Promise<Registro[]> {
  const linhas =
    volta === undefined
      ? await db.getAllAsync<LinhaRegistro>(
          'SELECT * FROM registros WHERE ciclo_id = ? ORDER BY data DESC, id DESC',
          cicloId,
        )
      : await db.getAllAsync<LinhaRegistro>(
          'SELECT * FROM registros WHERE ciclo_id = ? AND volta = ? ORDER BY data DESC, id DESC',
          cicloId,
          volta,
        );
  return linhas.map(paraRegistro);
}

/** Todos os registros, ou só os de um ciclo, para as estatísticas. */
export async function listarRegistros(db: SQLiteDatabase, cicloId?: number): Promise<Registro[]> {
  const linhas =
    cicloId === undefined
      ? await db.getAllAsync<LinhaRegistro>('SELECT * FROM registros ORDER BY data DESC, id DESC')
      : await db.getAllAsync<LinhaRegistro>(
          'SELECT * FROM registros WHERE ciclo_id = ? ORDER BY data DESC, id DESC',
          cicloId,
        );
  return linhas.map(paraRegistro);
}
