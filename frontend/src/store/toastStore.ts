import { create } from "zustand";

export type TipoToast = "exito" | "error" | "info";

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

interface ToastState {
  toasts: Toast[];
  mostrar: (mensaje: string, tipo?: TipoToast) => void;
  cerrar: (id: number) => void;
}

let siguienteId = 1;

/** Notificaciones efímeras de la UI (estado del cliente, sin persistencia). */
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  mostrar: (mensaje, tipo = "info") => {
    const id = siguienteId++;
    set((s) => ({ toasts: [...s.toasts, { id, tipo, mensaje }] }));
    window.setTimeout(() => get().cerrar(id), 4000);
  },
  cerrar: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  exito: (m: string) => useToastStore.getState().mostrar(m, "exito"),
  error: (m: string) => useToastStore.getState().mostrar(m, "error"),
  info: (m: string) => useToastStore.getState().mostrar(m, "info"),
};
