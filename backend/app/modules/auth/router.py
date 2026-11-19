from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import COOKIE_NAME
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import AuthService, CredencialesInvalidas, CuentaDesactivada, UsuarioDuplicado
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registra un usuario con rol user",
)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e


@router.post("/token", response_model=MessageResponse, summary="Login (formulario OAuth2); setea la cookie HttpOnly")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    try:
        token = service.autenticar(form_data.username, form_data.password)
    except CredencialesInvalidas as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e
    except CuentaDesactivada as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    # El token NO viaja en el cuerpo de la respuesta.
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse, summary="Borra la cookie de sesión")
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        path="/",
    )
    return MessageResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic, summary="Usuario autenticado")
def me(current_user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
    return current_user
