from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    usuarios: UsuarioRepository

    def _init_repositories(self, session: Session) -> None:
        self.usuarios = UsuarioRepository(session)

    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()
        return self
