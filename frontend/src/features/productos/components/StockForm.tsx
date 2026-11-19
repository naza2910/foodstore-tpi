import { useForm } from "@tanstack/react-form";
import type { Producto, ProductoStockUpdate } from "@/features/productos/types/producto";
import { Button } from "@/shared/ui/Button";
import { Input, mensajeError } from "@/shared/ui/Input";

interface StockFormProps {
  producto: Producto;
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>;
  onCancelar: () => void;
}

export function StockForm({ producto, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => onGuardar(value),
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <p className="text-sm text-stone-600">
        Stock actual de <strong>{producto.nombre}</strong>: {producto.stock} unidades.
      </p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isNaN(value) ? "Ingresá el stock" : value < 0 ? "No puede ser negativo" : !Number.isInteger(value) ? "Debe ser entero" : undefined,
        }}
      >
        {(field) => (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Nuevo stock"
                type="number"
                min={0}
                step={1}
                autoFocus
                value={Number.isNaN(field.state.value) ? "" : field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta.errors)}
              />
            </div>
            {[5, 10, 20].map((n) => (
              <Button key={n} variante="secundario" tamano="sm" className="mb-0.5" onClick={() => field.handleChange((field.state.value || 0) + n)}>
                +{n}
              </Button>
            ))}
          </div>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 accent-marca-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
              Guardar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
