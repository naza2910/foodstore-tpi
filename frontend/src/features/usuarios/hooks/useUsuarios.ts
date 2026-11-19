import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usuariosApi from "@/features/usuarios/api/usuarios";

export const usuariosKeys = {
  all: ["usuarios"] as const,
};

export function useUsuarios(habilitado = true) {
  return useQuery({ queryKey: usuariosKeys.all, queryFn: usuariosApi.getUsuarios, enabled: habilitado });
}

export function useActivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.activarUsuario(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: usuariosKeys.all }),
  });
}

export function useDesactivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.desactivarUsuario(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: usuariosKeys.all }),
  });
}
