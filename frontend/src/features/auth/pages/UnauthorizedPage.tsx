import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { LinkButton } from "@/shared/ui/LinkButton";

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      icono="🔒"
      titulo="No tenés permiso para ver esta página"
      descripcion="Esta sección es solo para administradores."
      accion={
        <LinkButton to="/">Volver al inicio</LinkButton>
      }
    />
  );
}
