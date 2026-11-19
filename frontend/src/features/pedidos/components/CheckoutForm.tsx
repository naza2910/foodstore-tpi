import { useForm } from "@tanstack/react-form";
import type { FormaPago, PedidoCreate } from "@/features/pedidos/types/pedido";
import { Button } from "@/shared/ui/Button";
import { mensajeError, TextArea } from "@/shared/ui/Input";
import type { ItemCarrito } from "@/store/cartStore";

interface CheckoutFormProps {
  items: ItemCarrito[];
  enviando: boolean;
  onConfirmar: (pedido: PedidoCreate) => Promise<void>;
}

interface ValoresCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

const formasPago: { valor: FormaPago; titulo: string; descripcion: string; icono: string }[] = [
  { valor: "EFECTIVO", titulo: "Efectivo", descripcion: "Pagás al recibir el pedido", icono: "💵" },
  { valor: "TRANSFERENCIA", titulo: "Transferencia", descripcion: "Te enviamos el alias al confirmar", icono: "🏦" },
];

export function CheckoutForm({ items, enviando, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" } as ValoresCheckout,
    onSubmit: async ({ value }) => {
      await onConfirmar({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: value.forma_pago,
        direccion_entrega: value.direccion_entrega.trim(),
        notas: value.notas.trim() || null,
      });
    },
  });

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "La dirección no puede superar los 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <TextArea
            label="Dirección de entrega"
            rows={2}
            placeholder="Calle, número, piso, depto, ciudad"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            ayuda={`${field.state.value.trim().length}/200`}
            error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-stone-700">Forma de pago</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {formasPago.map((fp) => {
                const activo = field.state.value === fp.valor;
                return (
                  <label
                    key={fp.valor}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${activo ? "border-marca-500 bg-marca-50 ring-1 ring-marca-500" : "border-stone-300 bg-white hover:bg-stone-50"}`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={fp.valor}
                      checked={activo}
                      onChange={() => field.handleChange(fp.valor)}
                      className="mt-1 accent-marca-600"
                    />
                    <span>
                      <span className="block font-medium text-stone-800">
                        {fp.icono} {fp.titulo}
                      </span>
                      <span className="block text-xs text-stone-500">{fp.descripcion}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}
      >
        {(field) => (
          <TextArea
            label="Notas (opcional)"
            rows={2}
            placeholder="Ej.: sin cebolla, tocar timbre 2B…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" tamano="lg" className="w-full" disabled={!canSubmit || items.length === 0} cargando={isSubmitting || enviando}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
