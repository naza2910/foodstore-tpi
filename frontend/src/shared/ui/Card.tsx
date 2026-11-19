import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  titulo?: ReactNode;
  acciones?: ReactNode;
}

export function Card({ titulo, acciones, className = "", children, ...props }: CardProps) {
  return (
    <div className={`rounded-xl border border-stone-200 bg-white shadow-sm ${className}`} {...props}>
      {(titulo || acciones) && (
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3">
          {titulo && <h2 className="font-semibold text-stone-800">{titulo}</h2>}
          {acciones}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
