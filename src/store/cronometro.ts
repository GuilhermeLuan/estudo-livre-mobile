import { create } from 'zustand';

type CronometroState = {
  /** Timestamp (ms) do início da sessão ativa; null quando não há cronômetro rodando. */
  iniciadoEm: number | null;
  iniciar: () => void;
  parar: () => number;
};

export const useCronometro = create<CronometroState>((set, get) => ({
  iniciadoEm: null,
  iniciar: () => set({ iniciadoEm: Date.now() }),
  /** Encerra a sessão e devolve a duração em milissegundos. */
  parar: () => {
    const { iniciadoEm } = get();
    set({ iniciadoEm: null });
    return iniciadoEm ? Date.now() - iniciadoEm : 0;
  },
}));
