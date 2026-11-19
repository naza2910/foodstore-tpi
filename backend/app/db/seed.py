"""Seed idempotente: crea el admin, las categorías y los productos si no existen.

Uso (desde la carpeta backend/):  python -m app.db.seed
"""

import app.db.base  # noqa: F401
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ADMIN = {
    "username": "admin",
    "password": "Admin1234!",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
}

CATEGORIAS: list[dict[str, str]] = [
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra, enteras de 8 porciones"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas caseras con papas"},
    {"nombre": "Empanadas", "descripcion": "Empanadas al horno, por unidad"},
    {"nombre": "Bebidas", "descripcion": "Bebidas frías"},
    {"nombre": "Postres", "descripcion": "Postres y helados"},
]


def _img(photo_id: str) -> str:
    return f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=600&q=70"


PRODUCTOS: list[dict[str, str | float | int]] = [
    {"categoria": "Pizzas", "nombre": "Pizza Muzzarella", "descripcion": "Salsa de tomate, muzzarella y aceitunas.",
     "precio_base": 9500, "stock": 25, "imagen_url": _img("photo-1513104890138-7c749659a591")},
    {"categoria": "Pizzas", "nombre": "Pizza Napolitana", "descripcion": "Muzzarella, rodajas de tomate, ajo y albahaca.",
     "precio_base": 11000, "stock": 20, "imagen_url": _img("photo-1574071318508-1cdbab80d002")},
    {"categoria": "Pizzas", "nombre": "Pizza Fugazzeta", "descripcion": "Cebolla caramelizada y abundante muzzarella.",
     "precio_base": 10500, "stock": 15, "imagen_url": _img("photo-1565299624946-b28f40a0ae38")},
    {"categoria": "Hamburguesas", "nombre": "Hamburguesa Clásica", "descripcion": "Medallón de 180 g, lechuga, tomate y cheddar.",
     "precio_base": 8500, "stock": 30, "imagen_url": _img("photo-1568901346375-23c9450c58cd")},
    {"categoria": "Hamburguesas", "nombre": "Hamburguesa Doble Bacon", "descripcion": "Doble medallón, panceta crocante y salsa barbacoa.",
     "precio_base": 11500, "stock": 18, "imagen_url": _img("photo-1553979459-d2229ba7433b")},
    {"categoria": "Hamburguesas", "nombre": "Papas Fritas", "descripcion": "Porción grande de papas bastón.",
     "precio_base": 4500, "stock": 40, "imagen_url": _img("photo-1573080496219-bb080dd4f877")},
    {"categoria": "Empanadas", "nombre": "Empanada de Carne", "descripcion": "Carne cortada a cuchillo, al horno.",
     "precio_base": 1500, "stock": 120, "imagen_url": _img("photo-1604908554007-087c3a1f7b4c")},
    {"categoria": "Empanadas", "nombre": "Empanada de Jamón y Queso", "descripcion": "Jamón cocido y muzzarella.",
     "precio_base": 1400, "stock": 100, "imagen_url": _img("photo-1625944230945-1b7dd3b949ab")},
    {"categoria": "Bebidas", "nombre": "Gaseosa 1,5 L", "descripcion": "Cola, lima-limón o naranja.",
     "precio_base": 3200, "stock": 50, "imagen_url": _img("photo-1581636625402-29b2a704ef13")},
    {"categoria": "Bebidas", "nombre": "Agua Mineral 500 ml", "descripcion": "Con o sin gas.",
     "precio_base": 1500, "stock": 60, "imagen_url": _img("photo-1548839140-29a749e1cf4d")},
    {"categoria": "Postres", "nombre": "Helado 1/4 kg", "descripcion": "Dos sabores a elección.",
     "precio_base": 5000, "stock": 20, "imagen_url": _img("photo-1497034825429-c343d7c6a68f")},
    {"categoria": "Postres", "nombre": "Brownie con Nueces", "descripcion": "Brownie húmedo de chocolate con nueces.",
     "precio_base": 3800, "stock": 3, "imagen_url": _img("photo-1606313564200-e75d5e30476c")},
]


def seed_admin() -> None:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username(ADMIN["username"]) is not None:
            print("  · admin ya existe")
            return
        uow.usuarios.add(
            Usuario(
                username=ADMIN["username"],
                full_name=ADMIN["full_name"],
                email=ADMIN["email"],
                hashed_password=hash_password(ADMIN["password"]),
                role="admin",
            )
        )
        print("  + admin creado (admin / Admin1234!)")


def seed_categorias() -> None:
    with CategoriaUnitOfWork() as uow:
        for data in CATEGORIAS:
            if uow.categorias.get_by_nombre(data["nombre"]) is None:
                uow.categorias.add(Categoria(nombre=data["nombre"], descripcion=data["descripcion"]))
                print(f"  + categoría {data['nombre']}")


def seed_productos() -> None:
    with ProductoUnitOfWork() as uow:
        existentes = {p.nombre for p in uow.productos.get_all(limit=10_000)}
        for data in PRODUCTOS:
            if data["nombre"] in existentes:
                continue
            categoria = uow.categorias.get_by_nombre(str(data["categoria"]))
            if categoria is None or categoria.id is None:
                continue
            uow.productos.add(
                Producto(
                    categoria_id=categoria.id,
                    nombre=str(data["nombre"]),
                    descripcion=str(data["descripcion"]),
                    precio_base=float(data["precio_base"]),
                    stock=int(data["stock"]),
                    imagen_url=str(data["imagen_url"]),
                )
            )
            print(f"  + producto {data['nombre']}")


def run() -> None:
    print("Creando tablas…")
    create_all_tables()
    print("Cargando datos iniciales…")
    seed_admin()
    seed_categorias()
    seed_productos()
    print("Seed terminado.")


if __name__ == "__main__":
    run()
