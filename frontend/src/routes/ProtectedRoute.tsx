import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth/types/auth";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  /** Si se indica, además de la sesión exige uno de estos roles. */
  roles?: Rol[];
  children?: ReactNode;
}

/**
 * Sin sesión redirige a /login (recordando a dónde quería ir); sin el rol, a /unauthorized.
 * Es solo UX: la protección real la hace el backend con require_role.
 */
export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-stone-500">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-marca-200 border-t-marca-600" />
        <span className="text-sm">Verificando sesión…</span>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
