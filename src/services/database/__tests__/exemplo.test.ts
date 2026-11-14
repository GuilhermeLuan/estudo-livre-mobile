import { DatabaseSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { migrarBanco } from '../migracoes';
import { carregarDadosDeExemplo } from '../exemplo';
import { listarCiclos } from '../ciclos';
import { listarRegistros } from '../registros';

/** Adapta o SQLite do Node à parte da API do expo-sqlite que o código do app usa. */
function bancoEmMemoria(): SQLiteDatabase {
  const raw = new DatabaseSync(':memory:');
  const args = (a: unknown[]) => (a.length === 1 && Array.isArray(a[0]) ? a[0] : a) as never[];
  const db = {
    execAsync: async (sql: string) => void raw.exec(sql),
    runAsync: async (sql: string, ...a: unknown[]) => {
      const r = raw.prepare(sql).run(...args(a));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    getAllAsync: async (sql: string, ...a: unknown[]) => raw.prepare(sql).all(...args(a)),
    getFirstAsync: async (sql: string, ...a: unknown[]) => raw.prepare(sql).get(...args(a)) ?? null,
    withTransactionAsync: async (fn: () => Promise<void>) => {
      raw.exec('BEGIN');
      try {
        await fn();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
  return db as unknown as SQLiteDatabase;
}

test('carrega 3 ciclos com registros e e recarregar substitui', async () => {
  const db = bancoEmMemoria();
  await migrarBanco(db);
  await carregarDadosDeExemplo(db);
  const ciclos = await listarCiclos(db);
  expect(ciclos.map((c) => c.ativo)).toEqual([false, false, true]);
  expect((await listarRegistros(db)).length).toBeGreaterThan(20);
  await carregarDadosDeExemplo(db); // recarregar substitui, sem duplicar
  expect(await listarCiclos(db)).toHaveLength(3);
});
