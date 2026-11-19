from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie

from app.core.security import COOKIE_NAME, decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# Esquema de seguridad por cookie: además de leerla, hace que /docs muestre los candados.
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(token: str | None = Depends(cookie_scheme)) -> UserPublic:
    """Lee la cookie HttpOnly, valida firma y expiración y carga el usuario."""
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o la sesión expiró",
    )
    if not token:
        raise no_autenticado
    payload = decode_access_token(token)
    if payload is None or not payload.get("sub"):
        raise no_autenticado

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(str(payload["sub"]))
        if usuario is None:
            raise no_autenticado
        return UserPublic.model_validate(usuario)


def get_current_active_user(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return current_user


def require_role(roles: list[str]) -> Callable[..., UserPublic]:
    def checker(current_user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return current_user

    return checker
