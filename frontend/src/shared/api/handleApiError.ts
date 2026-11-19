import { isAxiosError } from "axios";

interface ErrorValidacion {
  loc?: (string | number)[];
  msg?: string;
}

/** Convierte el `detail` de la API en un mensaje legible para la pantalla. */
export function handleApiError(error: unknown, porDefecto = "Ocurrió un error inesperado"): string {
  if (isAxiosError<{ detail?: unknown }>(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servidor. ¿Está corriendo el backend?";
    }
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // Errores 422 de FastAPI: lista de { loc, msg }
      return (detail as ErrorValidacion[])
        .map((e) => {
          const campo = e.loc?.filter((parte) => parte !== "body").join(".");
          return campo ? `${campo}: ${e.msg ?? "valor inválido"}` : (e.msg ?? "valor inválido");
        })
        .join(" · ");
    }
    return `Error ${error.response.status}`;
  }
  if (error instanceof Error) return error.message;
  return porDefecto;
}
