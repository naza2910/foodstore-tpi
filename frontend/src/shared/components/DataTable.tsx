import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Paginacion } from "@/shared/components/Paginacion";

interface DataTableProps<T> {
  datos: T[];
  columnas: ColumnDef<T>[];
  filtroGlobal?: string;
  tamanoPagina?: number;
  mensajeVacio?: string;
}

/** Tabla de TanStack Table con orden, filtro global y paginación del lado del cliente. */
export function DataTable<T>({ datos, columnas, filtroGlobal = "", tamanoPagina = 10, mensajeVacio = "Sin resultados" }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { sorting, globalFilter: filtroGlobal },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: tamanoPagina } },
    autoResetPageIndex: true,
  });

  const filas = tabla.getRowModel().rows;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const ordenable = header.column.getCanSort();
                  const orden = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 ${ordenable ? "cursor-pointer select-none hover:text-stone-800" : ""}`}
                      onClick={ordenable ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {orden === "asc" ? " ▲" : orden === "desc" ? " ▼" : ""}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="px-4 py-10 text-center text-stone-500">
                  {mensajeVacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-stone-50/70">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-stone-700">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {tabla.getPageCount() > 1 && (
        <Paginacion
          pagina={tabla.getState().pagination.pageIndex}
          totalPaginas={tabla.getPageCount()}
          totalItems={tabla.getFilteredRowModel().rows.length}
          onCambiar={(p) => tabla.setPageIndex(p)}
        />
      )}
    </div>
  );
}
