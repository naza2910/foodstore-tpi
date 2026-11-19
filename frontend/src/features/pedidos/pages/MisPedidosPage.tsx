import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PedidoDetalle } from "@/features/pedidos/components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "@/features/pedidos/hooks/usePedidos";
import { ESTADOS_PEDIDO, ETIQUETA_ESTADO, type EstadoPedido, type Pedido } from "@/features/pedidos/types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { PageHeader } from "@/shared/layout/PageHeader";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Select } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { formatFecha, formatPrecio } from "@/shared/utils/format";
import { toast } from "@/store/toastStore";

const LIMIT = 10;

export function MisPedidosPage() {
  const location = useLocation();
  const pedidoNuevo = (location.state as { pedidoNuevo?: number } | null)?.pedidoNuevo;
  const [pagina, setPagina] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);

  const { data, isPending, isError, error, refetch } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT, estado });
  const cancelar = useCancelarPedido();

  const confirmarCancelacion = async () => {
    if (!aCancelar) return;
    try {
      await cancelar.mutateAsync(aCancelar.id);
      toast.exito(`Pedido #${aCancelar.id} cancelado`);
      setACancelar(null);
      setDetalle(null);
    } catch (e) {
      toast.error(handleApiError(e));
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Mis pedidos"
        subtitulo="Podés cancelar un pedido mientras esté pendiente."
        acciones={
          <div className="w-48">
            <Select
              aria-label="Filtrar por estado"
              value={estado ?? ""}
              onChange={(e) => {
                setEstado((e.target.value || undefined) as EstadoPedido | undefined);
                setPagina(0);
              }}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_PEDIDO.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {isPending ? (
        <SkeletonFilas filas={4} />
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          icono="🧾"
          titulo={estado ? "No tenés pedidos en ese estado" : "Todavía no hiciste pedidos"}
          accion={
            <LinkButton to="/">Ir al catálogo</LinkButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.items.map((p) => (
            <div
              key={p.id}
              className={`flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4 shadow-sm ${p.id === pedidoNuevo ? "border-marca-400 ring-2 ring-marca-200" : "border-stone-200"}`}
            >
              <div className="min-w-32">
                <p className="font-semibold text-stone-900">Pedido #{p.id}</p>
                <p className="text-xs text-stone-500">{formatFecha(p.created_at)}</p>
              </div>
              <BadgeEstado estado={p.estado} />
              <p className="flex-1 truncate text-sm text-stone-500">
                {p.items.map((i) => `${i.cantidad}× ${i.nombre_producto}`).join(", ")}
              </p>
              <p className="w-28 text-right font-bold text-stone-900">{formatPrecio(p.total)}</p>
              <div className="flex gap-2">
                <Button variante="secundario" tamano="sm" onClick={() => setDetalle(p)}>
                  Ver detalle
                </Button>
                {p.estado === "PENDIENTE" && (
                  <Button variante="peligro" tamano="sm" onClick={() => setACancelar(p)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / LIMIT)} totalItems={data.total} onCambiar={setPagina} />
        </div>
      )}

      <Modal
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={`Pedido #${detalle?.id ?? ""}`}
        ancho="lg"
        pie={
          detalle?.estado === "PENDIENTE" ? (
            <Button variante="peligro" onClick={() => setACancelar(detalle)}>
              Cancelar pedido
            </Button>
          ) : undefined
        }
      >
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <Modal
        abierto={aCancelar !== null}
        onCerrar={() => setACancelar(null)}
        titulo="¿Cancelar el pedido?"
        ancho="sm"
        pie={
          <>
            <Button variante="secundario" onClick={() => setACancelar(null)}>
              Volver
            </Button>
            <Button variante="peligro" cargando={cancelar.isPending} onClick={() => void confirmarCancelacion()}>
              Sí, cancelar
            </Button>
          </>
        }
      >
        <p className="text-sm text-stone-600">
          Vas a cancelar el pedido <strong>#{aCancelar?.id}</strong> por <strong>{formatPrecio(aCancelar?.total ?? 0)}</strong>. Esta acción no
          se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
