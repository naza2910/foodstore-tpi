import { useCallback, useMemo, useState } from "react";
import { PedidoDetalle } from "@/features/pedidos/components/PedidoDetalle";
import { TablaPedidos } from "@/features/pedidos/components/TablaPedidos";
import { useCambiarEstadoPedido, usePedidos } from "@/features/pedidos/hooks/usePedidos";
import { ESTADOS_PEDIDO, ETIQUETA_ESTADO, type EstadoPedido, type Pedido } from "@/features/pedidos/types/pedido";
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { PageHeader } from "@/shared/layout/PageHeader";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { formatPrecio } from "@/shared/utils/format";
import { toast } from "@/store/toastStore";

interface CambioPendiente {
  pedido: Pedido;
  estado: EstadoPedido;
}

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [cambio, setCambio] = useState<CambioPendiente | null>(null);

  // El panel pide hasta 100 pedidos y pagina del lado del cliente con TanStack Table.
  const { data, isPending, isError, error, refetch, isFetching } = usePedidos({ limit: 100, estado });
  const { data: usuarios } = useUsuarios();
  const cambiarEstado = useCambiarEstadoPedido();

  const nombres = useMemo(() => new Map(usuarios?.map((u) => [u.id, u.username]) ?? []), [usuarios]);
  const nombreCliente = useCallback((id: number) => nombres.get(id) ?? `Usuario #${id}`, [nombres]);

  const ejecutarCambio = async (pedido: Pedido, nuevo: EstadoPedido) => {
    try {
      const actualizado = await cambiarEstado.mutateAsync({ id: pedido.id, estado: nuevo });
      toast.exito(
        nuevo === "CANCELADO"
          ? `Pedido #${pedido.id} cancelado: se restituyó el stock`
          : `Pedido #${pedido.id} → ${ETIQUETA_ESTADO[nuevo]}`,
      );
      setCambio(null);
      if (detalle?.id === pedido.id) setDetalle(actualizado);
    } catch (e) {
      toast.error(handleApiError(e));
    }
  };

  const onCambiarEstado = useCallback((pedido: Pedido, nuevo: EstadoPedido) => setCambio({ pedido, estado: nuevo }), []);
  const onVer = useCallback((pedido: Pedido) => setDetalle(pedido), []);

  const filtros: (EstadoPedido | undefined)[] = [undefined, ...ESTADOS_PEDIDO];

  return (
    <div>
      <PageHeader
        titulo="Pedidos"
        subtitulo="Avanzá o cancelá los pedidos según su estado."
        acciones={
          <Button variante="secundario" onClick={() => void refetch()} cargando={isFetching}>
            Actualizar
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f ?? "todos"}
            type="button"
            onClick={() => setEstado(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${estado === f ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"}`}
          >
            {f ? ETIQUETA_ESTADO[f] : "Todos"}
          </button>
        ))}
        {data && <span className="ml-auto self-center text-sm text-stone-500">{data.total} pedidos</span>}
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <TablaPedidos
          pedidos={data.items}
          nombreCliente={nombreCliente}
          onVer={onVer}
          onCambiarEstado={onCambiarEstado}
          ocupadoId={cambiarEstado.isPending ? (cambio?.pedido.id ?? null) : null}
        />
      )}

      <Modal abierto={detalle !== null} onCerrar={() => setDetalle(null)} titulo={`Pedido #${detalle?.id ?? ""}`} ancho="lg">
        {detalle && <PedidoDetalle pedido={detalle} cliente={nombreCliente(detalle.usuario_id)} />}
      </Modal>

      <Modal
        abierto={cambio !== null}
        onCerrar={() => setCambio(null)}
        titulo="Confirmar cambio de estado"
        ancho="sm"
        pie={
          <>
            <Button variante="secundario" onClick={() => setCambio(null)}>
              Volver
            </Button>
            <Button
              variante={cambio?.estado === "CANCELADO" ? "peligro" : "primario"}
              cargando={cambiarEstado.isPending}
              onClick={() => cambio && void ejecutarCambio(cambio.pedido, cambio.estado)}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {cambio && (
          <div className="space-y-3 text-sm text-stone-600">
            <p>
              Pedido <strong>#{cambio.pedido.id}</strong> de <strong>{nombreCliente(cambio.pedido.usuario_id)}</strong> por{" "}
              <strong>{formatPrecio(cambio.pedido.total)}</strong>
            </p>
            <div className="flex items-center gap-2">
              <BadgeEstado estado={cambio.pedido.estado} /> <span>→</span> <BadgeEstado estado={cambio.estado} />
            </div>
            {cambio.estado === "CANCELADO" && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">Al cancelar se devuelve al stock la cantidad de cada producto.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
