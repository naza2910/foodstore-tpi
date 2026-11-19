import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";

interface EstadoErrorProps {
  error: unknown;
  onReintentar?: () => void;
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden>
        ⚠️
      </span>
      <h3 className="mt-2 font-semibold text-red-800">No pudimos cargar los datos</h3>
      <p className="mt-1 text-sm text-red-700">{handleApiError(error)}</p>
      {onReintentar && (
        <Button variante="secundario" className="mt-4" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
