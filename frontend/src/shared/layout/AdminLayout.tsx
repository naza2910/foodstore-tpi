import { NavLink, Outlet } from "react-router-dom";

const secciones = [
  { to: "/admin/resumen", texto: "Resumen", icono: "📊" },
  { to: "/admin/pedidos", texto: "Pedidos", icono: "🧾" },
  { to: "/admin/productos", texto: "Productos", icono: "🍕" },
  { to: "/admin/categorias", texto: "Categorías", icono: "🗂️" },
  { to: "/admin/usuarios", texto: "Usuarios", icono: "👥" },
];

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-52 lg:shrink-0">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">Panel de administración</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {secciones.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-marca-600 text-white" : "text-stone-600 hover:bg-stone-100"}`
              }
            >
              <span aria-hidden>{s.icono}</span>
              {s.texto}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">
        <Outlet />
      </section>
    </div>
  );
}
