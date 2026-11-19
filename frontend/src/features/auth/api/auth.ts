import type { Credenciales, MessageResponse, UserCreate, Usuario } from "@/features/auth/types/auth";
import { api } from "@/shared/api/axiosInstance";

export async function login({ username, password }: Credenciales): Promise<MessageResponse> {
  // Formulario OAuth2: application/x-www-form-urlencoded
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post<MessageResponse>("/auth/token", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function register(datos: UserCreate): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/auth/register", datos);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<Usuario> {
  const { data } = await api.get<Usuario>("/auth/me");
  return data;
}
