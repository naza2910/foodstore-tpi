import { useState } from "react";

/** Imagen con respaldo: si la URL falla o no existe, muestra la inicial sobre un degradado. */
export function ImagenProducto({ url, nombre, className = "" }: { url: string | null; nombre: string; className?: string }) {
  const [fallo, setFallo] = useState(false);

  if (!url || fallo) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-marca-100 to-amber-200 ${className}`}>
        <span className="text-3xl font-bold text-marca-700/70">{nombre.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  return <img src={url} alt={nombre} loading="lazy" onError={() => setFallo(true)} className={`object-cover ${className}`} />;
}
