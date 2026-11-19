interface TarjetaResumenProps {
  titulo: string;
  valor: string | number;
  icono: string;
  color: "amber" | "sky" | "emerald" | "stone" | "marca";
  detalle?: string;
}

const colores = {
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  stone: "bg-stone-200 text-stone-600",
  marca: "bg-marca-100 text-marca-700",
};

export function TarjetaResumen({ titulo, valor, icono, color, detalle }: TarjetaResumenProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{titulo}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${colores[color]}`} aria-hidden>
          {icono}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-stone-400">{detalle}</p>}
    </div>
  );
}
