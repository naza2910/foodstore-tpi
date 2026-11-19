import { ImagenProducto } from "@/features/productos/components/ImagenProducto";
import type { Producto } from "@/features/productos/types/producto";
import { Badge } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { formatPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0);

  const sinStock = producto.stock <= 0;
  const noDisponible = !producto.disponible;
  const tope = enCarrito >= producto.stock;
  const deshabilitado = sinStock || noDisponible || tope;

  const onAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });
    toast.exito(`${producto.nombre} agregado al carrito`);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <ImagenProducto url={producto.imagen_url} nombre={producto.nombre} className="h-40 w-full" />
        {(sinStock || noDisponible) && (
          <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            {noDisponible ? "No disponible" : "Sin stock"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-marca-700">{producto.categoria.nombre}</span>
        <h3 className="mt-1 font-semibold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}
        <div className="mt-2">
          {!sinStock && producto.stock <= 5 && <Badge color="rojo">¡Últimas {producto.stock} unidades!</Badge>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-lg font-bold text-stone-900">{formatPrecio(producto.precio_base)}</span>
          <Button tamano="sm" onClick={onAgregar} disabled={deshabilitado} title={tope && !sinStock ? "Ya tenés todo el stock en el carrito" : undefined}>
            {enCarrito > 0 ? `Agregar (${enCarrito})` : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </article>
  );
}
