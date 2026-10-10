import type { SQLiteDatabase } from 'expo-sqlite';

import type { Etapa } from '@/types/banco';
import { normalizarMateria } from '@/utils/normalizar';

type LinhaEtapa = {
  id: number;
  ciclo_id: number;
  posicao: number;
  materia: string;
  chave_materia: string;
  minutos: number;
};

const paraEtapa = (l: LinhaEtapa): Etapa => ({
  id: l.id,
  cicloId: l.ciclo_id,
  posicao: l.posicao,
  materia: l.materia,
  chaveMateria: l.chave_materia,
  minutos: l.minutos,
});

export async function listarEtapas(db: SQLiteDatabase, cicloId: number): Promise<Etapa[]> {
  const linhas = await db.getAllAsync<LinhaEtapa>(
    'SELECT * FROM etapas WHERE ciclo_id = ? ORDER BY posicao',
    cicloId,
  );
  return linhas.map(paraEtapa);
}

/** Adiciona a etapa no fim do ciclo. */
export async function criarEtapa(
  db: SQLiteDatabase,
  cicloId: number,
  materia: string,
  minutos: number,
): Promise<number> {
  const nome = materia.trim();
  const r = await db.runAsync(
    `INSERT INTO etapas (ciclo_id, posicao, materia, chave_materia, minutos)
     VALUES (?, (SELECT COALESCE(MAX(posicao) + 1, 0) FROM etapas WHERE ciclo_id = ?), ?, ?, ?)`,
    cicloId,
    cicloId,
    nome,
    normalizarMateria(nome),
    minutos,
  );
  return r.lastInsertRowId;
}

/**
 * Atualiza matéria e carga da etapa. Se a matéria mudou de chave e nenhuma outra etapa do ciclo
 * mantém a chave antiga, os registros dela passam para a nova chave.
 */
export async function atualizarEtapa(
  db: SQLiteDatabase,
  id: number,
  materia: string,
  minutos: number,
): Promise<void> {
  const nome = materia.trim();
  const chave = normalizarMateria(nome);
  await db.withTransactionAsync(async () => {
    const antes = await db.getFirstAsync<{ ciclo_id: number; chave_materia: string }>(
      'SELECT ciclo_id, chave_materia FROM etapas WHERE id = ?',
      id,
    );
    if (!antes) return;
    await db.runAsync(
      'UPDATE etapas SET materia = ?, chave_materia = ?, minutos = ? WHERE id = ?',
      nome,
      chave,
      minutos,
      id,
    );
    if (antes.chave_materia === chave) {
      // Só a grafia mudou: as outras etapas da mesma matéria mostram o mesmo nome.
      await db.runAsync(
        'UPDATE etapas SET materia = ? WHERE ciclo_id = ? AND chave_materia = ?',
        nome,
        antes.ciclo_id,
        chave,
      );
      return;
    }
    const restante = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM etapas WHERE ciclo_id = ? AND chave_materia = ?',
      antes.ciclo_id,
      antes.chave_materia,
    );
    if (restante?.n === 0) {
      await db.runAsync(
        'UPDATE registros SET chave_materia = ? WHERE ciclo_id = ? AND chave_materia = ?',
        chave,
        antes.ciclo_id,
        antes.chave_materia,
      );
    }
  });
}

/** Remove a etapa e recompacta as posições do ciclo. */
export async function excluirEtapa(db: SQLiteDatabase, id: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    const etapa = await db.getFirstAsync<{ ciclo_id: number }>(
      'SELECT ciclo_id FROM etapas WHERE id = ?',
      id,
    );
    if (!etapa) return;
    await db.runAsync('DELETE FROM etapas WHERE id = ?', id);
    await reposicionar(db, etapa.ciclo_id);
  });
}

/** Grava a nova ordem; `idsEmOrdem` deve conter todas as etapas do ciclo. */
export async function reordenarEtapas(
  db: SQLiteDatabase,
  cicloId: number,
  idsEmOrdem: number[],
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < idsEmOrdem.length; i++) {
      await db.runAsync(
        'UPDATE etapas SET posicao = ? WHERE id = ? AND ciclo_id = ?',
        i,
        idsEmOrdem[i],
        cicloId,
      );
    }
  });
}

async function reposicionar(db: SQLiteDatabase, cicloId: number): Promise<void> {
  const ids = await db.getAllAsync<{ id: number }>(
    'SELECT id FROM etapas WHERE ciclo_id = ? ORDER BY posicao',
    cicloId,
  );
  for (let i = 0; i < ids.length; i++) {
    await db.runAsync('UPDATE etapas SET posicao = ? WHERE id = ?', i, ids[i].id);
  }
}
