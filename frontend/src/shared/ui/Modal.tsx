import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: ReactNode;
  children: ReactNode;
  pie?: ReactNode;
  ancho?: "sm" | "md" | "lg";
}

const anchos = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ abierto, onCerrar, titulo, children, pie, ancho = "md" }: ModalProps) {
  // Cierra con Escape (efecto de UI, no obtiene datos).
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[1px]" onClick={onCerrar} />
      <div className={`relative flex max-h-[90vh] w-full ${anchos[ancho]} flex-col rounded-2xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
          <h3 className="text-lg font-semibold text-stone-800">{titulo}</h3>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {pie && <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-3">{pie}</div>}
      </div>
    </div>,
    document.body,
  );
}
