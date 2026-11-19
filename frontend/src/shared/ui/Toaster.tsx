import { useToastStore } from "@/store/toastStore";

const colores = {
  exito: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-stone-200 bg-white text-stone-800",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const cerrar = useToastStore((s) => s.cerrar);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast-in pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-md ${colores[t.tipo]}`}
          role="status"
        >
          <span className="flex-1">{t.mensaje}</span>
          <button type="button" onClick={() => cerrar(t.id)} className="opacity-50 hover:opacity-100" aria-label="Cerrar">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
