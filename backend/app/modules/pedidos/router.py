from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _traducir(e: Exception) -> HTTPException:
    """Traduce las excepciones de dominio a códigos HTTP."""
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    if isinstance(e, PedidoAjeno):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


ERRORES_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED, summary="Crea el pedido (RN-01)")
def crear_pedido(
    data: PedidoCreate,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear(usuario.id, data)
    except ERRORES_DOMINIO as e:
        raise _traducir(e) from e


@router.get("", response_model=PedidosPaginados, summary="Pedidos propios (user) o todos (admin)")
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: EstadoPedido | None = Query(default=None),
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar(
        usuario_id=usuario.id, es_admin=usuario.role == "admin", estado=estado, skip=skip, limit=limit
    )


# Se declara ANTES de /{pedido_id} para que "resumen" no se interprete como un id.
@router.get("/resumen", response_model=ResumenPedidos, summary="Indicadores del panel")
def resumen_pedidos(
    _: UserPublic = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead, summary="Detalle con sus líneas (dueño o admin)")
def obtener_pedido(
    pedido_id: int,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario.id, usuario.role == "admin")
    except ERRORES_DOMINIO as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, summary="Avanza o cancela (admin, RN-02/RN-03)")
def cambiar_estado_pedido(
    pedido_id: int,
    data: CambioEstado,
    _: UserPublic = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data)
    except ERRORES_DOMINIO as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead, summary="Cancela un pedido propio en PENDIENTE")
def cancelar_pedido(
    pedido_id: int,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario.id)
    except ERRORES_DOMINIO as e:
        raise _traducir(e) from e
