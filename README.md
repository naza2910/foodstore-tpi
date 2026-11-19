# Food Store — Trabajo Práctico Integrador · Programación 4

Aplicación web de pedidos de comida: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos con dirección y forma de pago; el negocio administra categorías, productos, stock, pedidos y usuarios desde un panel.

- **Alumno:** Nazareno Romero — Tecnicatura Universitaria en Programación a Distancia (UTN)
- **Repositorio público:** https://github.com/TU-USUARIO/foodstore-tpi   ⟵ _reemplazar por la URL real_
- **Video de demostración:** https://youtu.be/PENDIENTE   ⟵ _reemplazar por el link público_

| Usuario admin del seed | Contraseña |
|---|---|
| `admin` | `Admin1234!` |

---

## Stack

| Backend | Frontend |
|---|---|
| Python 3.11 – 3.13 (no 3.14) | Node.js 20.19 o superior |
| FastAPI 0.115 + SQLModel 0.0.22 | React 19 + TypeScript 5.9 (`strict`, sin `any`) |
| PostgreSQL 15+ (o SQLite para desarrollo) | Vite 7 + Tailwind CSS 4 |
| JWT en cookie HttpOnly (python-jose) | TanStack Query 5 · Form 1 · Table 8 |
| bcrypt (passlib 1.7.4 + bcrypt 4.0.1) | Zustand 5 (persist) · Axios · React Router 7 |

## Requisitos

- **Python 3.11, 3.12 o 3.13** (`python --version`).
- **PostgreSQL 15 o superior** con una base creada (por ejemplo `foodstore_db`). Si no tenés PostgreSQL, podés usar SQLite (ver *Variables de entorno*).
- **Node.js 20.19+** (`node --version`) y **pnpm 9+** (`npm install -g pnpm` o `corepack enable`).

## Estructura

```
foodstore/
├── README.md                 ← este archivo
├── backend/                  FastAPI + SQLModel (arquitectura en capas con Unit of Work)
│   ├── app/
│   │   ├── main.py           App, CORS con credenciales y routers bajo /api/v1
│   │   ├── core/             config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/          auth · usuarios · categorias · productos · pedidos
│   │   │   └── <módulo>/     models · schemas · repository · unit_of_work · service · router
│   │   └── db/seed.py        Seed idempotente (admin, categorías y productos)
│   ├── requirements.txt      Versiones fijadas
│   └── .env.example
└── frontend/                 React + TypeScript organizado por features
    ├── src/
    │   ├── shared/           api (axios, errores, queryClient) · ui · components · layout
    │   ├── features/         auth · categorias · productos · usuarios · pedidos
    │   │   └── <feature>/    pages · components · hooks · api · types
    │   ├── store/            authStore y cartStore (Zustand + persist)
    │   └── routes/           AppRouter y ProtectedRoute
    ├── package.json          Versiones fijadas
    └── .env.example
```

---

## 1. Backend

Desde la carpeta `backend/`:

**Windows (PowerShell o CMD)**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

**Linux / macOS**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Editá `backend/.env` con los datos de tu PostgreSQL (o pasá a SQLite, ver abajo). Después:

```bash
python -m app.db.seed          # crea las tablas y carga admin, 5 categorías y 12 productos (idempotente)
uvicorn app.main:app --reload  # http://localhost:8000
```

- Documentación interactiva: **http://localhost:8000/docs** (Swagger) y **http://localhost:8000/redoc**.
- Para probar en `/docs`: ejecutá `POST /api/v1/auth/token` con `admin` / `Admin1234!`; el navegador guarda la cookie y las demás peticiones la envían solas.

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS (admite varios separados por coma) | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si el backend se sirve por HTTPS | `false` |

**Usar SQLite en lugar de PostgreSQL:** en `backend/.env` poné `DATABASE_URL=sqlite:///./foodstore.db` y corré el seed. No hace falta instalar nada más.

**Crear la base en PostgreSQL** (si todavía no existe):

```bash
psql -U postgres -c "CREATE DATABASE foodstore_db;"
```

## 2. Frontend

En otra terminal, desde la carpeta `frontend/`:

```bash
cd frontend
pnpm install
copy .env.example .env        # Windows   (Linux/macOS: cp .env.example .env)
pnpm build                    # verifica los tipos (tsc) y compila
pnpm dev                      # http://localhost:5173
```

### Variables de entorno del frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

> **Importante:** abrí la app en **http://localhost:5173** (no en `127.0.0.1`). La cookie de sesión solo viaja si el frontend y el backend usan el mismo host (`localhost` en ambos).

---

## Funcionalidades

**Cliente (rol `user`)**
- Registro y login con TanStack Form y validaciones; la sesión viaja en la cookie HttpOnly `access_token` (el frontend nunca lee ni guarda el token).
- Catálogo paginado en el servidor (`skip = página × limit`), búsqueda por nombre, filtro por categoría, skeleton de carga y estado vacío.
- Carrito persistido en el navegador (Zustand + persist): cantidades, subtotales y total.
- Checkout con dirección (5 a 200 caracteres), forma de pago (efectivo o transferencia) y notas.
- «Mis pedidos» con filtro por estado, detalle y cancelación mientras el pedido está en `PENDIENTE`.

**Administrador (rol `admin`)**
- Resumen con tarjetas: pedidos de hoy, ingresos de entregados y conteos por estado.
- ABM de categorías y de productos con TanStack Table (orden, filtro y paginación del lado del cliente) y TanStack Form; cambio de stock y disponibilidad.
- Gestión de pedidos con filtro por estado y botones según la máquina de estados (`PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde los no terminales).
- Gestión de usuarios: activar y desactivar (el botón no aparece en la fila del propio admin).

## Reglas de negocio implementadas

| Regla | Dónde |
|---|---|
| **RN-01** Pedido transaccional: al menos un ítem, sin productos repetidos; cada producto activo, disponible y con stock; se descuenta stock y se copian nombre y precio en la misma iteración; si algo falla, rollback total. | `pedidos/service.py → crear` |
| **RN-02** Máquina de estados como diccionario; transición inválida → 400; estados terminales sin cambios. | `pedidos/service.py → TRANSICIONES` |
| **RN-03** Al cancelar se restituye el stock de cada línea en la misma transacción. | `pedidos/service.py → _restituir_stock` |
| **RN-04** El cliente solo ve y cancela lo suyo (y solo en `PENDIENTE`); el admin ve todo y avanza o cancela. | `pedidos/service.py`, `pedidos/router.py` |
| **RN-05** Líneas y total inmutables: no hay endpoints de edición ni borrado de pedidos. | `pedidos/models.py` |
| **RN-06** `forma_pago` ∈ {EFECTIVO, TRANSFERENCIA} y dirección de 5 a 200 caracteres, validadas en el schema. | `pedidos/schemas.py` |

**Unit of Work:** el único `session.commit()` del proyecto está en `core/unit_of_work.py` (`__exit__`: commit si no hubo excepción, rollback si la hubo, y siempre close). Los Services abren `with self.uow as uow:` y devuelven el schema de salida dentro del bloque; los Routers obtienen el Service con `Depends(get_<modulo>_service)` y traducen las excepciones de dominio a `HTTPException`.

## Endpoints (prefijo `/api/v1`)

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` · `/auth/token` · `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/admin/usuarios` | admin |
| POST | `/admin/usuarios/{id}/activar` · `/admin/usuarios/{id}/desactivar` | admin |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos` (`skip`, `limit`, `search`, `categoria_id`, `disponible`) · `/productos/{id}` | Público |
| POST · PUT · PATCH · DELETE | `/productos` · `/productos/{id}` · `/productos/{id}/stock` | admin |
| POST · GET | `/pedidos` | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

## Problemas comunes

- **`pip install` falla con Python 3.14:** SQLModel 0.0.22 no soporta 3.14; usá 3.11, 3.12 o 3.13.
- **Al loguearme vuelvo a /login o no me reconoce la sesión:** abrí el frontend en `http://localhost:5173` (no `127.0.0.1`) y verificá que `FRONTEND_ORIGIN` coincida.
- **Error de conexión a PostgreSQL:** revisá usuario, contraseña, puerto y que la base exista; o usá SQLite para desarrollo.
- **Las imágenes de productos no cargan:** son URLs públicas de Unsplash; sin conexión se muestra una imagen de respaldo con la inicial del producto.
