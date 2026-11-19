import { useForm } from "@tanstack/react-form";
import type { Categoria, CategoriaCreate } from "@/features/categorias/types/categoria";
import { Button } from "@/shared/ui/Button";
import { Input, mensajeError, TextArea } from "@/shared/ui/Input";

interface CategoriaFormProps {
  inicial?: Categoria | null;
  onGuardar: (datos: CategoriaCreate) => Promise<void>;
  onCancelar: () => void;
  error?: string | null;
}

export function CategoriaForm({ inicial, onGuardar, onCancelar, error }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? "", descripcion: inicial?.descripcion ?? "" },
    onSubmit: async ({ value }) => {
      await onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null });
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
            if (largo > 100) return "Máximo 100 caracteres";
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
      <form.Field name="descripcion" validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}>
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

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
              {inicial ? "Guardar cambios" : "Crear categoría"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
