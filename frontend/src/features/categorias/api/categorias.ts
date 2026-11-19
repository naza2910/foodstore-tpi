import type { Categoria, CategoriaCreate, CategoriaUpdate } from "@/features/categorias/types/categoria";
import { api } from "@/shared/api/axiosInstance";

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}

export async function crearCategoria(datos: CategoriaCreate): Promise<Categoria> {
  const { data } = await api.post<Categoria>("/categorias", datos);
  return data;
}

export async function actualizarCategoria(id: number, datos: CategoriaUpdate): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, datos);
  return data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
