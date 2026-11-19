import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as authApi from "@/features/auth/api/auth";
import type { Credenciales, Usuario } from "@/features/auth/types/auth";
import { queryClient } from "@/shared/api/queryClient";

interface AuthState {
  /** Usuario de la sesión (nombre, email y rol). El token NUNCA se guarda: vive en la cookie HttpOnly. */
  usuario: Usuario | null;
  /** true mientras checkSession confirma la sesión contra /auth/me. */
  cargando: boolean;
  login: (credenciales: Credenciales) => Promise<Usuario>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  /** Limpia la sesión local (la usa el interceptor ante un 401). */
  limpiar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (credenciales) => {
        await authApi.login(credenciales); // el backend setea la cookie
        const usuario = await authApi.getMe();
        queryClient.clear(); // evita mostrar datos cacheados de otra sesión
        set({ usuario, cargando: false });
        return usuario;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          queryClient.clear();
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = await authApi.getMe();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiar: () => {
        queryClient.clear();
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: "foodstore-auth",
      storage: createJSONStorage(() => localStorage),
      // Solo se persiste el usuario; nunca el token (ni el flag de carga).
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
