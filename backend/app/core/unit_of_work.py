from collections.abc import Callable
from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Unit of Work base.

    - ``__enter__`` abre la sesión y crea los repositorios que la comparten.
    - ``__exit__`` hace commit si no hubo excepción y rollback si la hubo; siempre cierra.

    Es el único lugar del proyecto donde se llama a ``session.commit()``.
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self._session_factory = session_factory
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("El Unit of Work no está abierto: usá 'with uow:'")
        return self._session

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aquí sus repositorios sobre la sesión compartida."""

    def __enter__(self) -> "UnitOfWork":
        self._session = self._session_factory()
        self._init_repositories(self._session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        session = self.session
        try:
            if exc_type is None:
                session.commit()
            else:
                session.rollback()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
            self._session = None
