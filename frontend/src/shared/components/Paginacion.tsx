import { Button } from "@/shared/ui/Button";

interface PaginacionProps {
  /** Página actual, empezando en 0. */
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
  totalItems?: number;
  deshabilitado?: boolean;
}

export function Paginacion({ pagina, totalPaginas, onCambiar, totalItems, deshabilitado = false }: PaginacionProps) {
  if (totalPaginas <= 1 && totalItems === undefined) return null;
  const paginas = Math.max(totalPaginas, 1);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
      <span>
        Página <strong>{pagina + 1}</strong> de <strong>{paginas}</strong>
        {totalItems !== undefined && <span className="text-stone-400"> · {totalItems} resultados</span>}
      </span>
      <div className="flex gap-2">
        <Button variante="secundario" tamano="sm" disabled={deshabilitado || pagina <= 0} onClick={() => onCambiar(pagina - 1)}>
          ← Anterior
        </Button>
        <Button
          variante="secundario"
          tamano="sm"
          disabled={deshabilitado || pagina >= paginas - 1}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
