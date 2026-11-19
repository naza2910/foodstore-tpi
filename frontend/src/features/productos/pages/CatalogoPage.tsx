import { useState } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { ProductoCard } from "@/features/productos/components/ProductoCard";
import { useProductos } from "@/features/productos/hooks/useProductos";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonTarjetas } from "@/shared/components/Skeleton";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Button } from "@/shared/ui/Button";

const LIMIT = 8;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const search = useDebounce(busqueda.trim());

  const { data: categorias } = useCategorias();
  // Paginación en el servidor: skip = página × limit
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId,
  });

  const totalPaginas = data ? Math.ceil(data.total / LIMIT) : 0;
  const hayFiltros = Boolean(search) || categoriaId !== undefined;

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaId(undefined);
    setPagina(0);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-marca-600 to-amber-500 px-6 py-8 text-white shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">¿Qué pedimos hoy?</h1>
        <p className="mt-1 text-white/90">Elegí tus platos, armá el carrito y recibilo en tu casa.</p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar por nombre…"
            aria-label="Buscar productos"
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-marca-500 focus:outline-none focus:ring-2 focus:ring-marca-200"
          />
        </div>
        {isFetching && !isPending && <span className="text-xs text-stone-400">Actualizando…</span>}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoría">
        <button
          type="button"
          onClick={() => {
            setCategoriaId(undefined);
            setPagina(0);
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${categoriaId === undefined ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"}`}
        >
          Todas
        </button>
        {categorias?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategoriaId(c.id);
              setPagina(0);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${categoriaId === c.id ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"}`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {isPending ? (
        <SkeletonTarjetas cantidad={LIMIT} />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          icono="🥡"
          titulo={hayFiltros ? "No encontramos productos con esos filtros" : "Todavía no hay productos"}
          descripcion={hayFiltros ? "Probá con otra búsqueda o categoría." : "Volvé más tarde."}
          accion={hayFiltros ? <Button variante="secundario" onClick={limpiarFiltros}>Limpiar filtros</Button> : undefined}
        />
      ) : (
        <div className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}>
          {data.items.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          totalItems={data.total}
          onCambiar={setPagina}
          deshabilitado={isPlaceholderData}
        />
      )}
    </div>
  );
}
