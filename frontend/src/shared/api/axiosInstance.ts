import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

export const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

// Endpoints donde un 401 es una respuesta esperada (credenciales malas o sin sesión al montar).
const RUTAS_SIN_INTERCEPCION = ["/auth/token", "/auth/me"];

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true, // el navegador adjunta la cookie HttpOnly en cada petición
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const detail = error.response?.data?.detail;

    const sesionInvalida = status === 401 && !RUTAS_SIN_INTERCEPCION.some((ruta) => url.includes(ruta));
    const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA;

    if (sesionInvalida || cuentaDesactivada) {
      // Al quedar sin usuario, ProtectedRoute redirige a /login.
      useAuthStore.getState().limpiar();
    }
    return Promise.reject(error);
  },
);
