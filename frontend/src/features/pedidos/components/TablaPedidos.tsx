import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { TRANSICIONES, type EstadoPedido, type Pedido } from "@/features/pedidos/types/pedido";
import { DataTable } from "@/shared/components/DataTable";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { formatFecha, formatPrecio } from "@/shared/utils/format";

const textoAccion: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Pasar a preparación",
  ENTREGADO: "Marcar entregado",
  CANCELADO: "Cancelar",
};

interface TablaPedidosProps {
  pedidos: Pedido[];
  nombreCliente: (usuarioId: number) => string;
  onVer: (pedido: Pedido) => void;
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
  ocupadoId: number | null;
}

export function TablaPedidos({ pedidos, nombreCliente, onVer, onCambiarEstado, ocupadoId }: TablaPedidosProps) {
  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: "id", header: "#", cell: ({ row }) => <span className="font-semibold">#{row.original.id}</span> },
      {
        id: "cliente",
        header: "Cliente",
        accessorFn: (p) => nombreCliente(p.usuario_id),
      },
      { accessorKey: "created_at", header: "Fecha", cell: ({ row }) => formatFecha(row.original.created_at) },
      { accessorKey: "estado", header: "Estado", cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      {
        accessorKey: "forma_pago",
        header: "Pago",
        cell: ({ row }) => (row.original.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span className="font-semibold">{formatPrecio(row.original.total)}</span>,
      },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => {
          const pedido = row.original;
          return (
            <div className="flex flex-wrap gap-1.5">
              <Button variante="fantasma" tamano="sm" onClick={() => onVer(pedido)}>
                Ver
              </Button>
              {TRANSICIONES[pedido.estado].map((destino) => (
                <Button
                  key={destino}
                  tamano="sm"
                  variante={destino === "CANCELADO" ? "peligro" : destino === "ENTREGADO" ? "exito" : "primario"}
                  disabled={ocupadoId === pedido.id}
                  onClick={() => onCambiarEstado(pedido, destino)}
                >
                  {textoAccion[destino]}
                </Button>
              ))}
            </div>
          );
        },
      },
    ],
    [nombreCliente, onVer, onCambiarEstado, ocupadoId],
  );

  return <DataTable datos={pedidos} columnas={columnas} tamanoPagina={10} mensajeVacio="No hay pedidos para mostrar" />;
}
