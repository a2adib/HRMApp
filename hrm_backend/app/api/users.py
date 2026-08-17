from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, role_required
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserListResponse, UserResponse
from app.services.user_service import add_user, get_employees_by_manager, get_users

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UserListResponse)
async def list_users(
    current_user: User = Depends(role_required("hr", "manager")),
    db: AsyncSession = Depends(get_db),
):
    users = await get_users(db)
    return UserListResponse(users=[UserResponse.model_validate(u) for u in users])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    current_user: User = Depends(role_required("hr")),
    db: AsyncSession = Depends(get_db),
):
    # Check username uniqueness
    existing = await db.execute(select(User).where(User.username == body.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")

    manager_id = None
    if body.manager:
        mgr_result = await db.execute(select(User).where(User.username == body.manager))
        mgr = mgr_result.scalar_one_or_none()
        if not mgr or mgr.role != "manager":
            raise HTTPException(status_code=400, detail="Invalid manager username")
        manager_id = mgr.id

    user = await add_user(db, body.username, body.password, body.role, manager_id)
    return UserResponse.model_validate(user)


@router.get("/employees", response_model=UserListResponse)
async def assigned_employees(
    current_user: User = Depends(role_required("manager")),
    db: AsyncSession = Depends(get_db),
):
    employees = await get_employees_by_manager(db, current_user.username)
    return UserListResponse(users=[UserResponse.model_validate(u) for u in employees])
