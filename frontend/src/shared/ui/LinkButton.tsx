import { Link, type LinkProps } from "react-router-dom";
import { clasesBoton, type Tamano, type Variante } from "@/shared/ui/Button";

interface LinkButtonProps extends LinkProps {
  variante?: Variante;
  tamano?: Tamano;
}

/** Link de navegación con el aspecto de un botón (evita anidar <button> dentro de <a>). */
export function LinkButton({ variante = "primario", tamano = "md", className = "", ...props }: LinkButtonProps) {
  return <Link className={clasesBoton(variante, tamano, typeof className === "string" ? className : "")} {...props} />;
}
