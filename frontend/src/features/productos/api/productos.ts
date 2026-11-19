import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "@/features/productos/types/producto";
import { api } from "@/shared/api/axiosInstance";

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>("/productos", {
    params: {
      skip: filtros.skip ?? 0,
      limit: filtros.limit ?? 20,
      search: filtros.search || undefined,
      categoria_id: filtros.categoria_id,
      disponible: filtros.disponible,
    },
  });
  return data;
}

export async function getProducto(id: number): Promise<Producto> {
  const { data } = await api.get<Producto>(`/productos/${id}`);
  return data;
}

export async function crearProducto(datos: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>("/productos", datos);
  return data;
}

export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

export async function actualizarStock(id: number, datos: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
