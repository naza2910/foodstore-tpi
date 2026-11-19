import type { Pedido } from "@/features/pedidos/types/pedido";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { formatFecha, formatPrecio } from "@/shared/utils/format";

const textoFormaPago = { EFECTIVO: "💵 Efectivo", TRANSFERENCIA: "🏦 Transferencia" } as const;

export function PedidoDetalle({ pedido, cliente }: { pedido: Pedido; cliente?: string }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-stone-50 p-3">
        <div>
          <p className="text-xs text-stone-500">Estado</p>
          <BadgeEstado estado={pedido.estado} />
        </div>
        <div>
          <p className="text-xs text-stone-500">Creado</p>
          <p className="font-medium">{formatFecha(pedido.created_at)}</p>
        </div>
        <div>
          <p className="text-xs text-stone-500">Forma de pago</p>
          <p className="font-medium">{textoFormaPago[pedido.forma_pago]}</p>
        </div>
        <div>
          <p className="text-xs text-stone-500">Última actualización</p>
          <p className="font-medium">{formatFecha(pedido.updated_at)}</p>
        </div>
        {cliente && (
          <div className="col-span-2">
            <p className="text-xs text-stone-500">Cliente</p>
            <p className="font-medium">{cliente}</p>
          </div>
        )}
        <div className="col-span-2">
          <p className="text-xs text-stone-500">Dirección de entrega</p>
          <p className="font-medium">{pedido.direccion_entrega}</p>
        </div>
        {pedido.notas && (
          <div className="col-span-2">
            <p className="text-xs text-stone-500">Notas</p>
            <p className="italic text-stone-700">“{pedido.notas}”</p>
          </div>
        )}
      </div>

      <table className="w-full text-left">
        <thead className="text-xs uppercase text-stone-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{formatPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right font-medium">{formatPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200 text-base font-bold">
            <td className="pt-3" colSpan={3}>
              Total
            </td>
            <td className="pt-3 text-right">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
