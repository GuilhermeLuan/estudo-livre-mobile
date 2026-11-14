import type { SQLiteDatabase } from 'expo-sqlite';

import fallback from '@/data/concursos-fallback.json';
import type { DadosConcursos } from '@/types/concursos';
import { buscarConfiguracao, salvarConfiguracao } from './database/config';

export const URL_CONCURSOS = 'https://bishoppython.github.io/oconcurseiro/data/concursos.json';
const CHAVE_CONCURSOS = 'concursos';

export type CacheConcursos = { baixadoEm: string; dados: DadosConcursos };

export async function buscarConcursos(buscar: typeof fetch = fetch): Promise<DadosConcursos> {
  const resposta = await buscar(URL_CONCURSOS);
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  const dados = await resposta.json();
  if (!dados || !Array.isArray(dados.concursos)) throw new Error('Formato inválido');
  return { atualizado: dados.atualizado, ufs: dados.ufs ?? {}, concursos: dados.concursos };
}

export const carregarCacheConcursos = (db: SQLiteDatabase) =>
  buscarConfiguracao<CacheConcursos>(db, CHAVE_CONCURSOS);

/** Baixa e só então grava no cache; qualquer falha deixa o cache anterior intacto. */
export async function atualizarConcursos(db: SQLiteDatabase, buscar: typeof fetch = fetch): Promise<CacheConcursos> {
  const cache = { baixadoEm: new Date().toISOString(), dados: await buscarConcursos(buscar) };
  await salvarConfiguracao(db, CHAVE_CONCURSOS, cache);
  return cache;
}

/** Cópia embutida no app, para a primeira abertura sem rede e sem cache. */
export const CACHE_EMBUTIDO: CacheConcursos = {
  baixadoEm: (fallback as unknown as DadosConcursos).atualizado,
  dados: fallback as unknown as DadosConcursos,
};
