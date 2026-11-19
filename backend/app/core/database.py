from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=_connect_args, pool_pre_ping=True)


def session_factory() -> Session:
    """Crea una sesión nueva. Solo la usa el Unit of Work (y las dependencias de sesión)."""
    return Session(engine)


def create_all_tables() -> None:
    """Crea las tablas de las cinco entidades si no existen."""
    import app.db.base  # noqa: F401  (registra todos los modelos en el metadata)

    SQLModel.metadata.create_all(engine)
