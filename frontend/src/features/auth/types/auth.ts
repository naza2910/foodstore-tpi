export type { Rol, Usuario } from "@/features/usuarios/types/usuario";

/** Schema UserCreate del backend. */
export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface Credenciales {
  username: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
