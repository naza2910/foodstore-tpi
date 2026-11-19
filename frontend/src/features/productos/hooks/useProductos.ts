import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productosApi from "@/features/productos/api/productos";
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate, ProductoUpdate } from "@/features/productos/types/producto";

export const productosKeys = {
  all: ["productos"] as const,
  list: (filtros: FiltrosProductos) => ["productos", filtros] as const,
};

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: productosKeys.list(filtros),
    queryFn: () => productosApi.getProductos(filtros),
    placeholderData: keepPreviousData, // mantiene la página anterior mientras llega la nueva
  });
}

function useInvalidarProductos() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: productosKeys.all });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (datos: ProductoCreate) => productosApi.crearProducto(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) => productosApi.actualizarProducto(id, datos),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => productosApi.actualizarStock(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (id: number) => productosApi.eliminarProducto(id),
    onSuccess: invalidar,
  });
}
