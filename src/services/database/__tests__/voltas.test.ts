import { DatabaseSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { listarRegistros } from '../registros';
import { buscarCiclo, criarCiclo } from '../ciclos';
import { criarEtapa } from '../etapas';
import { migrarBanco } from '../migracoes';
import { iniciarNovaVolta, registrarEstudo, voltaAtualTemRegistros } from '../voltas';
import { calcularEstatisticas } from '@/utils/estatisticas';

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

async function cenario() {
  const db = bancoEmMemoria();
  await migrarBanco(db);
  const cicloId = await criarCiclo(db, 'PF');
  await criarEtapa(db, cicloId, 'Português', 60);
  await criarEtapa(db, cicloId, 'Direito', 120);
  const estudo = (chaveMateria: string, minutos: number, volta = 1) => ({
    cicloId,
    volta,
    chaveMateria,
    conteudo: null,
    data: '2026-10-10',
    minutos,
    tipo: null,
    questoes: null,
    acertos: null,
    anotacao: null,
  });
  return { db, cicloId, estudo };
}

describe('fechamento automático da volta', () => {
  it('não avança enquanto falta carga', async () => {
    const { db, cicloId, estudo } = await cenario();
    expect(await registrarEstudo(db, estudo('portugues', 60))).toBe(false);
    expect((await buscarCiclo(db, cicloId))?.voltaAtual).toBe(1);
  });

  it('avança ao completar a última etapa', async () => {
    const { db, cicloId, estudo } = await cenario();
    await registrarEstudo(db, estudo('portugues', 60));
    expect(await registrarEstudo(db, estudo('direito', 120))).toBe(true);
    expect((await buscarCiclo(db, cicloId))?.voltaAtual).toBe(2);
    expect(await voltaAtualTemRegistros(db, cicloId)).toBe(false);
  });

  it('mantém as horas extras na volta em que foram feitas', async () => {
    const { db, cicloId, estudo } = await cenario();
    await registrarEstudo(db, estudo('portugues', 90));
    await registrarEstudo(db, estudo('direito', 120));
    const registros = await listarRegistros(db, cicloId);
    expect(registros.every((r) => r.volta === 1)).toBe(true);
    expect(registros.reduce((s, r) => s + r.minutos, 0)).toBe(210);
    expect(await voltaAtualTemRegistros(db, cicloId)).toBe(false);
  });
});

describe('casos de borda do fechamento', () => {
  it('registro de volta antiga não fecha a volta aberta', async () => {
    const { db, cicloId, estudo } = await cenario();
    await registrarEstudo(db, estudo('portugues', 60));
    await registrarEstudo(db, estudo('direito', 120)); // fecha a volta 1
    expect(await registrarEstudo(db, estudo('portugues', 60, 1))).toBe(false);
    expect((await buscarCiclo(db, cicloId))?.voltaAtual).toBe(2);
  });

  it('ciclo sem etapas nunca fecha sozinho', async () => {
    const db = bancoEmMemoria();
    await migrarBanco(db);
    const cicloId = await criarCiclo(db, 'Vazio');
    const fechou = await registrarEstudo(db, {
      cicloId, volta: 1, chaveMateria: 'x', conteudo: null, data: '2026-10-10',
      minutos: 30, tipo: null, questoes: null, acertos: null, anotacao: null,
    });
    expect(fechou).toBe(false);
    expect(await iniciarNovaVolta(db, cicloId)).toBe(true);
  });

  it('desfaz o registro se a transação falha', async () => {
    const { db, cicloId, estudo } = await cenario();
    await expect(registrarEstudo(db, { ...estudo('portugues', 0) })).rejects.toThrow();
    expect(await listarRegistros(db, cicloId)).toHaveLength(0);
  });
});

describe('nova volta manual', () => {
  it('não faz nada sem registro na volta atual', async () => {
    const { db, cicloId } = await cenario();
    expect(await voltaAtualTemRegistros(db, cicloId)).toBe(false);
    expect(await iniciarNovaVolta(db, cicloId)).toBe(false);
    expect((await buscarCiclo(db, cicloId))?.voltaAtual).toBe(1);
  });

  it('soma as horas de todas as voltas nas estatísticas', async () => {
    const { db, cicloId, estudo } = await cenario();
    await registrarEstudo(db, estudo('portugues', 30));
    await iniciarNovaVolta(db, cicloId);
    await registrarEstudo(db, estudo('portugues', 45, 2));
    const stats = calcularEstatisticas({ registros: await listarRegistros(db), agora: '2026-10-11' });
    expect(stats.materias.find((m) => m.chaveMateria === 'portugues')?.minutos).toBe(75);
  });

  it('encerra a volta como está e mantém as horas nas estatísticas', async () => {
    const { db, cicloId, estudo } = await cenario();
    await registrarEstudo(db, estudo('portugues', 30));
    expect(await voltaAtualTemRegistros(db, cicloId)).toBe(true);
    expect(await iniciarNovaVolta(db, cicloId)).toBe(true);
    expect((await buscarCiclo(db, cicloId))?.voltaAtual).toBe(2);
    expect(await voltaAtualTemRegistros(db, cicloId)).toBe(false);

    const registros = await listarRegistros(db, cicloId);
    expect(registros).toHaveLength(1);
    expect(registros[0].volta).toBe(1);
    const stats = calcularEstatisticas({ registros, cicloId, agora: '2026-10-11' });
    expect(stats.materias.find((m) => m.chaveMateria === 'portugues')?.minutos).toBe(30);
  });
});
