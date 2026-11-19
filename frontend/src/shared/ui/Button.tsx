import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma" | "exito";
type Tamano = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
  icono?: ReactNode;
}

const estilosVariante: Record<Variante, string> = {
  primario: "bg-marca-600 text-white hover:bg-marca-700 focus-visible:ring-marca-500",
  secundario: "bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 focus-visible:ring-stone-400",
  peligro: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  exito: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  fantasma: "bg-transparent text-stone-600 hover:bg-stone-100 focus-visible:ring-stone-400",
};

const estilosTamano: Record<Tamano, string> = {
  sm: "px-2.5 py-1.5 text-xs gap-1",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-3 text-base gap-2",
};

/** Clases del botón, reutilizadas por LinkButton. */
export function clasesBoton(variante: Variante = "primario", tamano: Tamano = "md", extra = ""): string {
  return `inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${estilosVariante[variante]} ${estilosTamano[tamano]} ${extra}`;
}

export type { Variante, Tamano };

export function Button({
  variante = "primario",
  tamano = "md",
  cargando = false,
  icono,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={clasesBoton(variante, tamano, className)}
      {...props}
    >
      {cargando ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      ) : (
        icono
      )}
      {children}
    </button>
  );
}
