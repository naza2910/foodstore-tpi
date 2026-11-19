import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 disabled:bg-stone-100";
const normal = "border-stone-300 focus:border-marca-500 focus:ring-marca-200";
const conError = "border-red-400 focus:border-red-500 focus:ring-red-200";

/** Normaliza los errores de TanStack Form (pueden venir como string o como objetos). */
export function mensajeError(errores: readonly unknown[] | undefined): string | undefined {
  if (!errores || errores.length === 0) return undefined;
  const textos = errores
    .map((e) => (typeof e === "string" ? e : e && typeof e === "object" && "message" in e ? String(e.message) : ""))
    .filter(Boolean);
  return textos.length ? textos.join(", ") : undefined;
}

interface CampoProps {
  label?: string;
  error?: string;
  ayuda?: ReactNode;
}

function Campo({ id, label, error, ayuda, children }: CampoProps & { id: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : (
        ayuda && <p className="text-xs text-stone-500">{ayuda}</p>
      )}
    </div>
  );
}

export function Input({ label, error, ayuda, id, className = "", ...props }: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Campo id={inputId} label={label} error={error} ayuda={ayuda}>
      <input id={inputId} aria-invalid={!!error} className={`${base} ${error ? conError : normal} ${className}`} {...props} />
    </Campo>
  );
}

export function TextArea({ label, error, ayuda, id, className = "", ...props }: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Campo id={inputId} label={label} error={error} ayuda={ayuda}>
      <textarea id={inputId} aria-invalid={!!error} className={`${base} ${error ? conError : normal} ${className}`} {...props} />
    </Campo>
  );
}

export function Select({ label, error, ayuda, id, className = "", children, ...props }: CampoProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Campo id={inputId} label={label} error={error} ayuda={ayuda}>
      <select id={inputId} aria-invalid={!!error} className={`${base} ${error ? conError : normal} ${className}`} {...props}>
        {children}
      </select>
    </Campo>
  );
}
