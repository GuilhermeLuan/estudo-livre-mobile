import { create } from 'zustand';

type ToastState = {
  mensagem: string | null;
  mostrar: (mensagem: string) => void;
  esconder: () => void;
};

export const useToast = create<ToastState>((set) => ({
  mensagem: null,
  mostrar: (mensagem) => set({ mensagem }),
  esconder: () => set({ mensagem: null }),
}));
