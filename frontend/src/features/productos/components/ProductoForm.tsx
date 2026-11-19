import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/features/categorias/types/categoria";
import type { Producto, ProductoCreate } from "@/features/productos/types/producto";
import { Button } from "@/shared/ui/Button";
import { Input, mensajeError, Select, TextArea } from "@/shared/ui/Input";

interface ProductoFormProps {
  inicial?: Producto | null;
  categorias: Categoria[];
  onGuardar: (datos: ProductoCreate) => Promise<void>;
  onCancelar: () => void;
  error?: string | null;
}

interface ValoresProducto {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export function ProductoForm({ inicial, categorias, onGuardar, onCancelar, error }: ProductoFormProps) {
  const valoresIniciales: ValoresProducto = {
    nombre: inicial?.nombre ?? "",
    descripcion: inicial?.descripcion ?? "",
    precio_base: inicial?.precio_base ?? 0,
    imagen_url: inicial?.imagen_url ?? "",
    stock: inicial?.stock ?? 0,
    disponible: inicial?.disponible ?? true,
    categoria_id: inicial?.categoria_id ?? categorias[0]?.id ?? 0,
  };

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      await onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      });
    },
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
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 2) return "Mínimo 2 caracteres";
            if (largo > 150) return "Máximo 150 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            autoFocus
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? mensajeError(field.state.meta.errors) : undefined}
          />
        )}
      </form.Field>

      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (!value ? "Elegí una categoría" : undefined) }}>
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value || ""}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta.errors)}
          >
            {categorias.length === 0 && <option value="">No hay categorías: creá una primero</option>}
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{ onChange: ({ value }) => (Number.isNaN(value) ? "Ingresá un precio" : value < 0 ? "El precio no puede ser negativo" : undefined) }}
        >
          {(field) => (
            <Input
              label="Precio base ($)"
              type="number"
              min={0}
              step="0.01"
              value={Number.isNaN(field.state.value) ? "" : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta.errors)}
            />
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value) ? "Ingresá el stock" : value < 0 ? "No puede ser negativo" : !Number.isInteger(value) ? "Debe ser entero" : undefined,
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={Number.isNaN(field.state.value) ? "" : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="descripcion" validators={{ onChange: ({ value }) => (value.length > 1000 ? "Máximo 1000 caracteres" : undefined) }}>
        {(field) => (
          <TextArea
            label="Descripción"
            rows={3}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta.errors)}
          />
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

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || categorias.length === 0} cargando={isSubmitting}>
              {inicial ? "Guardar cambios" : "Crear producto"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
