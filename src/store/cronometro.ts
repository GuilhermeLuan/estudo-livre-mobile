import type { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

import { buscarSessao, descartarSessao, salvarSessao } from '@/services/database/cronometro';
import type { SessaoCronometro } from '@/types/banco';
import { tempoDecorridoMs } from '@/utils/tempoCronometro';

type Estado = {
  sessao: SessaoCronometro | null;
  pronto: boolean;
  ocupado: boolean;
  hidratar: (db: SQLiteDatabase) => Promise<void>;
  iniciar: (db: SQLiteDatabase, cicloId: number) => Promise<void>;
  pausar: (db: SQLiteDatabase) => Promise<void>;
  retomar: (db: SQLiteDatabase) => Promise<void>;
  descartar: (db: SQLiteDatabase) => Promise<void>;
  limpar: () => void;
};

export const useCronometro = create<Estado>((set, get) => ({
  sessao: null,
  pronto: false,
  ocupado: false,

  hidratar: async (db) => {
    const sessao = await buscarSessao(db);
    if (!get().ocupado) set({ sessao, pronto: true });
  },

  iniciar: async (db, cicloId) => {
    if (get().ocupado || get().sessao) return;
    set({ ocupado: true });
    try {
      const existente = await buscarSessao(db);
      if (existente) {
        set({ sessao: existente, pronto: true });
        return;
      }
      const nova = { cicloId, iniciadoEm: Date.now(), acumuladoMs: 0, pausadoEm: null };
      await salvarSessao(db, nova);
      set({ sessao: nova, pronto: true });
    } finally {
      set({ ocupado: false });
    }
  },

  pausar: async (db) => {
    const atual = get().sessao;
    if (!atual || atual.pausadoEm !== null || get().ocupado) return;
    set({ ocupado: true });
    try {
      const agora = Date.now();
      const pausada = { ...atual, acumuladoMs: tempoDecorridoMs(atual, agora), pausadoEm: agora };
      await salvarSessao(db, pausada);
      set({ sessao: pausada });
    } finally {
      set({ ocupado: false });
    }
  },

  retomar: async (db) => {
    const atual = get().sessao;
    if (!atual || atual.pausadoEm === null || get().ocupado) return;
    set({ ocupado: true });
    try {
      const retomada = { ...atual, iniciadoEm: Date.now(), pausadoEm: null };
      await salvarSessao(db, retomada);
      set({ sessao: retomada });
    } finally {
      set({ ocupado: false });
    }
  },

  descartar: async (db) => {
    if (get().ocupado) return;
    set({ ocupado: true });
    try {
      await descartarSessao(db);
      set({ sessao: null, pronto: true });
    } finally {
      set({ ocupado: false });
    }
  },
  limpar: () => set({ sessao: null, pronto: true }),
}));
