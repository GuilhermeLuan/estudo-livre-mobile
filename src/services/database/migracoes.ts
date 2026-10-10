import type { SQLiteDatabase } from 'expo-sqlite';

/** Cada item leva o banco de `índice` para `índice + 1`. Nunca edite uma migração já publicada. */
const MIGRACOES: string[] = [
  `
  CREATE TABLE ciclos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 0 CHECK (ativo IN (0, 1)),
    volta_atual INTEGER NOT NULL DEFAULT 1 CHECK (volta_atual >= 1),
    criado_em INTEGER NOT NULL
  );

  CREATE TABLE etapas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ciclo_id INTEGER NOT NULL REFERENCES ciclos(id) ON DELETE CASCADE,
    posicao INTEGER NOT NULL,
    materia TEXT NOT NULL,
    chave_materia TEXT NOT NULL,
    minutos INTEGER NOT NULL CHECK (minutos > 0)
  );
  CREATE INDEX idx_etapas_ciclo ON etapas(ciclo_id, posicao);

  CREATE TABLE registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ciclo_id INTEGER NOT NULL REFERENCES ciclos(id) ON DELETE CASCADE,
    volta INTEGER NOT NULL,
    chave_materia TEXT NOT NULL,
    conteudo TEXT,
    data TEXT NOT NULL,
    minutos INTEGER NOT NULL CHECK (minutos > 0),
    tipo TEXT CHECK (tipo IN ('teoria', 'exercicios', 'revisao', 'videoaula', 'leitura_lei')),
    questoes INTEGER CHECK (questoes IS NULL OR questoes >= 0),
    acertos INTEGER CHECK (acertos IS NULL OR (questoes IS NOT NULL AND acertos >= 0 AND acertos <= questoes)),
    anotacao TEXT,
    criado_em INTEGER NOT NULL
  );
  CREATE INDEX idx_registros_ciclo_volta ON registros(ciclo_id, volta, chave_materia);
  CREATE INDEX idx_registros_data ON registros(data);

  CREATE TABLE cronometro (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    ciclo_id INTEGER NOT NULL REFERENCES ciclos(id) ON DELETE CASCADE,
    iniciado_em INTEGER NOT NULL,
    acumulado_ms INTEGER NOT NULL DEFAULT 0,
    pausado_em INTEGER
  );
  `,
];

/** Abre o banco no estado mais recente. Idempotente: reabrir o app não recria nem apaga dados. */
export async function migrarBanco(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const versaoAtual = linha?.user_version ?? 0;

  for (let versao = versaoAtual; versao < MIGRACOES.length; versao++) {
    // Não use withExclusiveTransactionAsync: ele abre outra conexão, sem foreign_keys = ON.
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRACOES[versao]);
      await db.execAsync(`PRAGMA user_version = ${versao + 1}`);
    });
  }
}
