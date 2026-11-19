import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as categoriasApi from "@/features/categorias/api/categorias";
import type { CategoriaCreate, CategoriaUpdate } from "@/features/categorias/types/categoria";

export const categoriasKeys = {
  all: ["categorias"] as const,
};

export function useCategorias() {
  return useQuery({ queryKey: categoriasKeys.all, queryFn: categoriasApi.getCategorias });
}

function useInvalidarCatalogo() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: categoriasKeys.all });
    // Los productos incluyen su categoría: también se refrescan.
    void qc.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: (datos: CategoriaCreate) => categoriasApi.crearCategoria(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) => categoriasApi.actualizarCategoria(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.eliminarCategoria(id),
    onSuccess: invalidar,
  });
}
