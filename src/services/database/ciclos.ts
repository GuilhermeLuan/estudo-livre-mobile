import type { SQLiteDatabase } from 'expo-sqlite';

import type { Ciclo } from '@/types/banco';

type LinhaCiclo = {
  id: number;
  nome: string;
  ativo: number;
  volta_atual: number;
  criado_em: number;
};

const paraCiclo = (l: LinhaCiclo): Ciclo => ({
  id: l.id,
  nome: l.nome,
  ativo: l.ativo === 1,
  voltaAtual: l.volta_atual,
  criadoEm: l.criado_em,
});

export async function listarCiclos(db: SQLiteDatabase): Promise<Ciclo[]> {
  const linhas = await db.getAllAsync<LinhaCiclo>('SELECT * FROM ciclos ORDER BY criado_em DESC, id DESC');
  return linhas.map(paraCiclo);
}

export async function buscarCiclo(db: SQLiteDatabase, id: number): Promise<Ciclo | null> {
  const linha = await db.getFirstAsync<LinhaCiclo>('SELECT * FROM ciclos WHERE id = ?', id);
  return linha ? paraCiclo(linha) : null;
}

export async function buscarCicloAtivo(db: SQLiteDatabase): Promise<Ciclo | null> {
  const linha = await db.getFirstAsync<LinhaCiclo>('SELECT * FROM ciclos WHERE ativo = 1');
  return linha ? paraCiclo(linha) : null;
}

/** Cria o ciclo na volta 1. Fica ativo se `ativo` for true (ou se for o primeiro). */
export async function criarCiclo(db: SQLiteDatabase, nome: string, ativo = false): Promise<number> {
  let id = 0;
  await db.withTransactionAsync(async () => {
    const existente = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM ciclos');
    const ficaAtivo = ativo || existente?.n === 0;
    if (ficaAtivo) await db.runAsync('UPDATE ciclos SET ativo = 0');
    const r = await db.runAsync(
      'INSERT INTO ciclos (nome, ativo, volta_atual, criado_em) VALUES (?, ?, 1, ?)',
      nome,
      ficaAtivo ? 1 : 0,
      Date.now(),
    );
    id = r.lastInsertRowId;
  });
  return id;
}

export async function renomearCiclo(db: SQLiteDatabase, id: number, nome: string): Promise<void> {
  await db.runAsync('UPDATE ciclos SET nome = ? WHERE id = ?', nome, id);
}

/** Torna o ciclo o único ativo. */
export async function definirCicloAtivo(db: SQLiteDatabase, id: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE ciclos SET ativo = 0');
    await db.runAsync('UPDATE ciclos SET ativo = 1 WHERE id = ?', id);
  });
}

export async function definirVoltaAtual(db: SQLiteDatabase, id: number, volta: number): Promise<void> {
  await db.runAsync('UPDATE ciclos SET volta_atual = ? WHERE id = ?', volta, id);
}

/** Apaga o ciclo; etapas, registros e cronômetro dele saem em cascata. */
export async function excluirCiclo(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM ciclos WHERE id = ?', id);
}
