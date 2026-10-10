import type { SQLiteDatabase } from 'expo-sqlite';

import type { SessaoCronometro } from '@/types/banco';

type LinhaCronometro = {
  ciclo_id: number;
  iniciado_em: number;
  acumulado_ms: number;
  pausado_em: number | null;
};

export async function buscarSessao(db: SQLiteDatabase): Promise<SessaoCronometro | null> {
  const l = await db.getFirstAsync<LinhaCronometro>('SELECT * FROM cronometro WHERE id = 1');
  return l
    ? { cicloId: l.ciclo_id, iniciadoEm: l.iniciado_em, acumuladoMs: l.acumulado_ms, pausadoEm: l.pausado_em }
    : null;
}

/** Grava a sessão, substituindo a anterior: nunca há mais de uma linha. */
export async function salvarSessao(db: SQLiteDatabase, s: SessaoCronometro): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO cronometro (id, ciclo_id, iniciado_em, acumulado_ms, pausado_em)
     VALUES (1, ?, ?, ?, ?)`,
    s.cicloId,
    s.iniciadoEm,
    s.acumuladoMs,
    s.pausadoEm,
  );
}

export async function descartarSessao(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM cronometro WHERE id = 1');
}
