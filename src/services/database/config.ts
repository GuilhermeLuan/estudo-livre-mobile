import type { SQLiteDatabase } from 'expo-sqlite';

export const NOME_BANCO = 'estudo-livre.db';

export const CHAVE_LEMBRETES = 'lembretes';

export async function buscarConfiguracao<T>(db: SQLiteDatabase, chave: string): Promise<T | null> {
  const linha = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM configuracoes WHERE chave = ?',
    chave,
  );
  return linha ? (JSON.parse(linha.valor) as T) : null;
}

export async function salvarConfiguracao<T>(db: SQLiteDatabase, chave: string, valor: T): Promise<void> {
  await db.runAsync(
    `INSERT INTO configuracoes (chave, valor) VALUES (?, ?)
     ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`,
    chave,
    JSON.stringify(valor),
  );
}
