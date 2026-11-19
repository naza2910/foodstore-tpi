import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { ImagenProducto } from "@/features/productos/components/ImagenProducto";
import { ProductoForm } from "@/features/productos/components/ProductoForm";
import { StockForm } from "@/features/productos/components/StockForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "@/features/productos/hooks/useProductos";
import type { Producto, ProductoCreate, ProductoStockUpdate } from "@/features/productos/types/producto";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoError } from "@/shared/components/EstadoError";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { PageHeader } from "@/shared/layout/PageHeader";
import { Badge } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { formatPrecio } from "@/shared/utils/format";
import { toast } from "@/store/toastStore";

export function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const { data, isPending, isError, error, refetch } = useProductos({ limit: 100 });
  const { data: categorias = [] } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [filtro, setFiltro] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [stockDe, setStockDe] = useState<Producto | null>(null);
  const [aEliminar, setAEliminar] = useState<Producto | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const abrirForm = (producto: Producto | null) => {
    setEditando(producto);
    setErrorForm(null);
    setFormAbierto(true);
  };

  const guardar = async (datos: ProductoCreate) => {
    setErrorForm(null);
    try {
      if (editando) {
        await actualizar.mutateAsync({ id: editando.id, datos });
        toast.exito("Producto actualizado");
      } else {
        await crear.mutateAsync(datos);
        toast.exito("Producto creado");
      }
      setFormAbierto(false);
    } catch (e) {
      setErrorForm(handleApiError(e));
    }
  };

  const guardarStock = async (datos: ProductoStockUpdate) => {
    if (!stockDe) return;
    try {
      await actualizarStock.mutateAsync({ id: stockDe.id, datos });
      toast.exito(`Stock de ${stockDe.nombre}: ${datos.stock}`);
      setStockDe(null);
    } catch (e) {
      toast.error(handleApiError(e));
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    try {
      await eliminar.mutateAsync(aEliminar.id);
      toast.exito(`"${aEliminar.nombre}" dado de baja`);
      setAEliminar(null);
    } catch (e) {
      toast.error(handleApiError(e));
    }
  };

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ImagenProducto url={row.original.imagen_url} nombre={row.original.nombre} className="h-10 w-10 shrink-0 rounded-lg" />
            <span className="font-medium">{row.original.nombre}</span>
          </div>
        ),
      },
      { id: "categoria", header: "Categoría", accessorFn: (p) => p.categoria.nombre },
      { accessorKey: "precio_base", header: "Precio", cell: ({ row }) => formatPrecio(row.original.precio_base) },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <span className={`font-semibold ${row.original.stock === 0 ? "text-red-600" : row.original.stock <= 5 ? "text-amber-600" : ""}`}>
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: "disponible",
        header: "Disponible",
        cell: ({ row }) => (row.original.disponible ? <Badge color="verde">Sí</Badge> : <Badge color="rojo">No</Badge>),
      },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            <Button variante="secundario" tamano="sm" onClick={() => setStockDe(row.original)}>
              Stock
            </Button>
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
      <PageHeader
        titulo="Productos"
        subtitulo={data ? `${data.total} productos activos` : "Catálogo del negocio"}
        acciones={<Button onClick={() => abrirForm(null)}>+ Nuevo producto</Button>}
      />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Filtrar por nombre o categoría…" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar" />
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <DataTable datos={data.items} columnas={columnas} filtroGlobal={filtro} mensajeVacio="No hay productos" />
      )}

      <Modal
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        titulo={editando ? `Editar "${editando.nombre}"` : "Nuevo producto"}
        ancho="lg"
      >
        <ProductoForm
          key={editando?.id ?? "nuevo"}
          inicial={editando}
          categorias={categorias}
          onGuardar={guardar}
          onCancelar={() => setFormAbierto(false)}
          error={errorForm}
        />
      </Modal>

      <Modal abierto={stockDe !== null} onCerrar={() => setStockDe(null)} titulo="Stock y disponibilidad" ancho="sm">
        {stockDe && <StockForm key={stockDe.id} producto={stockDe} onGuardar={guardarStock} onCancelar={() => setStockDe(null)} />}
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        onCerrar={() => setAEliminar(null)}
        titulo="¿Dar de baja el producto?"
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
          <strong>{aEliminar?.nombre}</strong> deja de aparecer en el catálogo. Los pedidos que ya lo incluyen no cambian.
        </p>
      </Modal>
    </div>
  );
}
