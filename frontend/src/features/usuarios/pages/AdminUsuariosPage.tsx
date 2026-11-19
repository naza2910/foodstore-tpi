import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import type { Usuario } from "@/features/usuarios/types/usuario";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoError } from "@/shared/components/EstadoError";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { PageHeader } from "@/shared/layout/PageHeader";
import { Badge } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { formatFecha } from "@/shared/utils/format";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

export function AdminUsuariosPage() {
  const { data, isPending, isError, error, refetch } = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const yo = useAuthStore((s) => s.usuario);
  const [filtro, setFiltro] = useState("");

  const columnas = useMemo<ColumnDef<Usuario>[]>(() => {
    const cambiar = async (u: Usuario, accion: "activar" | "desactivar") => {
      try {
        await (accion === "activar" ? activar : desactivar).mutateAsync(u.id);
        toast.exito(`${u.username} ${accion === "activar" ? "activado" : "desactivado"}`);
      } catch (e) {
        toast.error(handleApiError(e));
      }
    };

    return [
      { accessorKey: "username", header: "Usuario", cell: ({ row }) => <span className="font-medium">{row.original.username}</span> },
      { accessorKey: "full_name", header: "Nombre" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => <Badge color={row.original.role === "admin" ? "naranja" : "stone"}>{row.original.role}</Badge>,
      },
      {
        accessorKey: "disabled",
        header: "Estado",
        cell: ({ row }) => (row.original.disabled ? <Badge color="rojo">Desactivado</Badge> : <Badge color="verde">Activo</Badge>),
      },
      { accessorKey: "created_at", header: "Alta", cell: ({ row }) => formatFecha(row.original.created_at) },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          // El botón Desactivar no se muestra en la fila del usuario de la sesión.
          if (u.id === yo?.id) return <span className="text-xs text-stone-400">(vos)</span>;
          return u.disabled ? (
            <Button variante="exito" tamano="sm" disabled={activar.isPending} onClick={() => void cambiar(u, "activar")}>
              Activar
            </Button>
          ) : (
            <Button variante="peligro" tamano="sm" disabled={desactivar.isPending} onClick={() => void cambiar(u, "desactivar")}>
              Desactivar
            </Button>
          );
        },
      },
    ];
  }, [activar, desactivar, yo?.id]);

  return (
    <div>
      <PageHeader titulo="Usuarios" subtitulo="Activá o desactivá cuentas. Un usuario desactivado no puede iniciar sesión." />
      <div className="mb-4 max-w-sm">
        <Input placeholder="Buscar por usuario, nombre o email…" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar" />
      </div>
      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <DataTable datos={data} columnas={columnas} filtroGlobal={filtro} mensajeVacio="No hay usuarios" />
      )}
    </div>
  );
}
