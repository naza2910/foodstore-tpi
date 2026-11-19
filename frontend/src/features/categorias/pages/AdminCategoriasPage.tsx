import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { CategoriaForm } from "@/features/categorias/components/CategoriaForm";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "@/features/categorias/hooks/useCategorias";
import type { Categoria, CategoriaCreate } from "@/features/categorias/types/categoria";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoError } from "@/shared/components/EstadoError";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { PageHeader } from "@/shared/layout/PageHeader";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { toast } from "@/store/toastStore";

export function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const [filtro, setFiltro] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const abrirForm = (categoria: Categoria | null) => {
    setEditando(categoria);
    setErrorForm(null);
    setFormAbierto(true);
  };

  const guardar = async (datos: CategoriaCreate) => {
    setErrorForm(null);
    try {
      if (editando) {
        await actualizar.mutateAsync({ id: editando.id, datos });
        toast.exito("Categoría actualizada");
      } else {
        await crear.mutateAsync(datos);
        toast.exito("Categoría creada");
      }
      setFormAbierto(false);
    } catch (e) {
      setErrorForm(handleApiError(e));
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    try {
      await eliminar.mutateAsync(aEliminar.id);
      toast.exito(`Categoría "${aEliminar.nombre}" dada de baja`);
      setAEliminar(null);
    } catch (e) {
      toast.error(handleApiError(e));
    }
  };

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "nombre", header: "Nombre", cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({ row }) => <span className="text-stone-500">{row.original.descripcion || "—"}</span>,
      },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1.5">
            <Button variante="secundario" tamano="sm" onClick={() => abrirForm(row.original)}>
              Editar
            </Button>
            <Button variante="peligro" tamano="sm" onClick={() => setAEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader titulo="Categorías" subtitulo="Altas, bajas y modificaciones." acciones={<Button onClick={() => abrirForm(null)}>+ Nueva categoría</Button>} />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Filtrar categorías…" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar" />
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <DataTable datos={data} columnas={columnas} filtroGlobal={filtro} mensajeVacio="No hay categorías" />
      )}

      <Modal abierto={formAbierto} onCerrar={() => setFormAbierto(false)} titulo={editando ? `Editar "${editando.nombre}"` : "Nueva categoría"}>
        <CategoriaForm
          key={editando?.id ?? "nueva"}
          inicial={editando}
          onGuardar={guardar}
          onCancelar={() => setFormAbierto(false)}
          error={errorForm}
        />
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        onCerrar={() => setAEliminar(null)}
        titulo="¿Dar de baja la categoría?"
        ancho="sm"
        pie={
          <>
            <Button variante="secundario" onClick={() => setAEliminar(null)}>
              Volver
            </Button>
            <Button variante="peligro" cargando={eliminar.isPending} onClick={() => void confirmarEliminar()}>
              Dar de baja
            </Button>
          </>
        }
      >
        <p className="text-sm text-stone-600">
          La categoría <strong>{aEliminar?.nombre}</strong> deja de mostrarse. Es una baja lógica: su nombre sigue reservado y sus productos no se
          ocultan (dalos de baja aparte si querés retirarlos del catálogo).
        </p>
      </Modal>
    </div>
  );
}
