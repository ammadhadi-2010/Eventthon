from fastapi import APIRouter

from .hub_list_routes import router as list_router
from .hub_project_collab_routes import router as collab_router
from .hub_project_routes import router as project_router

router = APIRouter(prefix="/projects", tags=["Projects Hub"])
router.include_router(list_router)
router.include_router(collab_router)
router.include_router(project_router)
