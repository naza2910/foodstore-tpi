import { TarjetaResumen } from "@/features/pedidos/components/TarjetaResumen";
import { useResumenPedidos } from "@/features/pedidos/hooks/usePedidos";
import { EstadoError } from "@/shared/components/EstadoError";
import { Skeleton } from "@/shared/components/Skeleton";
import { PageHeader } from "@/shared/layout/PageHeader";
import { Button } from "@/shared/ui/Button";
import { formatPrecio } from "@/shared/utils/format";

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useResumenPedidos();

  return (
    <div>
      <PageHeader
        titulo="Resumen del negocio"
        subtitulo="Indicadores de los pedidos."
        acciones={
          <Button variante="secundario" onClick={() => void refetch()} cargando={isFetching}>
            Actualizar
          </Button>
        }
      />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} icono="📅" color="marca" detalle="Creados desde las 00:00" />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatPrecio(data.ingresos_entregados)}
            icono="💰"
            color="emerald"
            detalle="Suma de los pedidos entregados"
          />
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} icono="⏳" color="amber" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} icono="👨‍🍳" color="sky" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} icono="✅" color="emerald" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} icono="✖️" color="stone" />
        </div>
      )}
    </div>
  );
}
