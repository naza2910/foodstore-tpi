import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { Badge } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-marca-50 text-marca-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`;

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0));
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    toast.info("Sesión cerrada");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-3 flex items-center gap-2 text-lg font-bold text-stone-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marca-600 text-white">🍔</span>
          Food Store
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === "admin" && (
            <NavLink to="/admin" className={claseLink}>
              Panel admin
            </NavLink>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <NavLink to="/carrito" className={claseLink} aria-label="Carrito">
            <span className="relative inline-flex items-center gap-1">
              🛒 <span className="hidden sm:inline">Carrito</span>
              {cantidad > 0 && (
                <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-marca-600 px-1.5 text-xs font-bold text-white">
                  {cantidad}
                </span>
              )}
            </span>
          </NavLink>

          {usuario ? (
            <>
              <div className="hidden flex-col items-end leading-tight md:flex">
                <span className="text-sm font-medium text-stone-800">{usuario.full_name}</span>
                <Badge color={usuario.role === "admin" ? "naranja" : "stone"}>{usuario.role}</Badge>
              </div>
              <Button variante="secundario" tamano="sm" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <LinkButton to="/login" variante="fantasma" tamano="sm">Ingresar</LinkButton>
              <LinkButton to="/register" tamano="sm">Registrarse</LinkButton>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
