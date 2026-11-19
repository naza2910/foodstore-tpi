import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckoutForm } from "@/features/pedidos/components/CheckoutForm";
import { useCrearPedido } from "@/features/pedidos/hooks/usePedidos";
import type { PedidoCreate } from "@/features/pedidos/types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { PageHeader } from "@/shared/layout/PageHeader";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <EstadoVacio
        icono="🛒"
        titulo="No hay nada para confirmar"
        descripcion="Tu carrito está vacío."
        accion={
          <LinkButton to="/">Ir al catálogo</LinkButton>
        }
      />
    );
  }

  const onConfirmar = async (pedido: PedidoCreate) => {
    setError(null);
    try {
      const creado = await crearPedido.mutateAsync(pedido);
      toast.exito(`¡Pedido #${creado.id} confirmado!`);
      navigate("/mis-pedidos", { replace: true, state: { pedidoNuevo: creado.id } });
      vaciar();
    } catch (e) {
      setError(handleApiError(e));
    }
  };

  return (
    <div>
      <PageHeader titulo="Confirmar pedido" subtitulo="Revisá tu pedido e indicá dónde lo entregamos." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card titulo="Datos de entrega" className="lg:col-span-3">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              <strong>No se pudo crear el pedido:</strong> {error}
              <Link to="/carrito" className="ml-1 underline">
                Revisar carrito
              </Link>
            </div>
          )}
          <CheckoutForm items={items} enviando={crearPedido.isPending} onConfirmar={onConfirmar} />
        </Card>

        <Card titulo={`Tu pedido (${items.length} ${items.length === 1 ? "producto" : "productos"})`} className="h-fit lg:col-span-2">
          <ul className="divide-y divide-stone-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between py-2">
                <span className="text-stone-600">
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="font-medium">{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-base font-bold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
          <p className="mt-2 text-xs text-stone-400">El precio final se fija al confirmar y no cambia después.</p>
        </Card>
      </div>
    </div>
  );
}
