import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as pedidosApi from "@/features/pedidos/api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "@/features/pedidos/types/pedido";
import { productosKeys } from "@/features/productos/hooks/useProductos";

export const pedidosKeys = {
  all: ["pedidos"] as const,
  list: (filtros: FiltrosPedidos) => ["pedidos", "lista", filtros] as const,
  detalle: (id: number) => ["pedidos", "detalle", id] as const,
  resumen: ["pedidos", "resumen"] as const,
};

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: pedidosKeys.list(filtros),
    queryFn: () => pedidosApi.getPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: pedidosKeys.detalle(id ?? 0),
    queryFn: () => pedidosApi.getPedido(id ?? 0),
    enabled: id !== null,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: pedidosKeys.resumen, queryFn: pedidosApi.getResumenPedidos });
}

/** Crear, cancelar o cambiar el estado de un pedido modifica el stock: se invalidan pedidos y productos. */
function useInvalidarPedidosYStock() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: pedidosKeys.all });
    void qc.invalidateQueries({ queryKey: productosKeys.all });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => pedidosApi.crearPedido(datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelarPedido(id),
    onSuccess: invalidar,
  });
}
