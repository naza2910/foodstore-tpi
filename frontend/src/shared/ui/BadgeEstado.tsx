import type { ReactNode } from "react";
import type { EstadoPedido } from "@/features/pedidos/types/pedido";

const estilos: Record<EstadoPedido, { clase: string; texto: string }> = {
  PENDIENTE: { clase: "bg-amber-100 text-amber-800 ring-amber-200", texto: "Pendiente" },
  EN_PREPARACION: { clase: "bg-sky-100 text-sky-800 ring-sky-200", texto: "En preparación" },
  ENTREGADO: { clase: "bg-emerald-100 text-emerald-800 ring-emerald-200", texto: "Entregado" },
  CANCELADO: { clase: "bg-stone-200 text-stone-600 ring-stone-300", texto: "Cancelado" },
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { clase, texto } = estilos[estado];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${clase}`}>
      {texto}
    </span>
  );
}

export function Badge({ children, color = "stone" }: { children: ReactNode; color?: "stone" | "verde" | "rojo" | "naranja" }) {
  const colores = {
    stone: "bg-stone-100 text-stone-700",
    verde: "bg-emerald-100 text-emerald-700",
    rojo: "bg-red-100 text-red-700",
    naranja: "bg-marca-100 text-marca-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colores[color]}`}>{children}</span>;
}
