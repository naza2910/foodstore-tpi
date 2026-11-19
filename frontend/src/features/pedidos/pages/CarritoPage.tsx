import { Link, useNavigate } from "react-router-dom";
import { ImagenProducto } from "@/features/productos/components/ImagenProducto";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { PageHeader } from "@/shared/layout/PageHeader";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Card } from "@/shared/ui/Card";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio
        icono="🛒"
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo para armar tu pedido."
        accion={
          <LinkButton to="/">Ver catálogo</LinkButton>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        titulo="Tu carrito"
        subtitulo="Se guarda en este navegador aunque recargues la página."
        acciones={
          <Button variante="fantasma" onClick={vaciar}>
            Vaciar carrito
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div key={item.producto_id} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
              <ImagenProducto url={item.imagen_url} nombre={item.nombre} className="h-16 w-16 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatPrecio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center rounded-lg border border-stone-300">
                <button
                  type="button"
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  aria-label={`Restar una unidad de ${item.nombre}`}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                <button
                  type="button"
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stock}
                  aria-label={`Sumar una unidad de ${item.nombre}`}
                >
                  +
                </button>
              </div>
              <span className="w-24 text-right font-semibold text-stone-900">{formatPrecio(item.precio_unitario * item.cantidad)}</span>
              <button
                type="button"
                onClick={() => quitar(item.producto_id)}
                className="rounded-md p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Quitar ${item.nombre}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <Card titulo="Resumen" className="h-fit">
          <dl className="space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.producto_id} className="flex justify-between text-stone-600">
                <dt className="truncate pr-2">
                  {i.cantidad} × {i.nombre}
                </dt>
                <dd>{formatPrecio(i.precio_unitario * i.cantidad)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold text-stone-900">
              <dt>Total</dt>
              <dd>{formatPrecio(total)}</dd>
            </div>
          </dl>
          <Button className="mt-5 w-full" tamano="lg" onClick={() => navigate("/checkout")}>
            Continuar con el pedido
          </Button>
          <Link to="/" className="mt-3 block text-center text-sm text-stone-500 hover:text-stone-700">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </div>
  );
}
