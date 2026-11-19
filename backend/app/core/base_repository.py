from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones genéricas de acceso a datos. Sin reglas de negocio ni commit."""

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        return list(self.session.exec(select(self.model).offset(skip).limit(limit)).all())

    def add(self, entity: T) -> T:
        """Agrega la entidad y hace flush para obtener el id (el commit lo hace el UoW)."""
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        """Borrado físico genérico. El dominio usa baja lógica, así que los Services no lo llaman."""
        self.session.delete(entity)
        self.session.flush()
