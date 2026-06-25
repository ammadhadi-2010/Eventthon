"""Squad core HTTP routes split by domain (each module < 250 lines)."""
from fastapi import APIRouter

from .list_routes import fetch_all_squads, router as list_router
from .create_routes import create_squad_impl, router as create_router
from .member_read_routes import router as member_read_router
from .invite_routes import router as invite_router
from .member_manage_routes import router as member_manage_router
from .settings_routes import router as settings_router
from .project_crud_routes import router as project_crud_router
from .project_join_routes import router as project_join_router
from .files_routes import router as files_router
from .activity_lifecycle_routes import router as activity_lifecycle_router

router = APIRouter()
router.include_router(list_router)
router.include_router(create_router)
router.include_router(member_read_router)
router.include_router(invite_router)
router.include_router(member_manage_router)
router.include_router(settings_router)
router.include_router(project_crud_router)
router.include_router(project_join_router)
router.include_router(files_router)
router.include_router(activity_lifecycle_router)

__all__ = ["router", "fetch_all_squads", "create_squad_impl"]
