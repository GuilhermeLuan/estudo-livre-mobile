import { create } from 'zustand';

/** Sobe quando os dados mudam fora do fluxo normal (ex.: dados de exemplo), para a aba em foco recarregar. */
export const useVersaoDados = create<{ versao: number; subir: () => void }>((set) => ({
  versao: 0,
  subir: () => set((s) => ({ versao: s.versao + 1 })),
}));
