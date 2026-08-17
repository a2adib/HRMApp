from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, role_required
from app.database import get_db
from app.models.user import User
from app.schemas.leave import LeaveCreate, LeaveListResponse, LeaveResponse, LeaveStatusUpdate
from app.services.leave_service import create_leave_request, get_leave_requests, update_leave_status

router = APIRouter(prefix="/leave", tags=["leave"])


@router.post("", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    body: LeaveCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lr = await create_leave_request(
        db, current_user.username, current_user.role, body.from_date, body.to_date, body.reason
    )
    return LeaveResponse.model_validate(lr)


@router.get("", response_model=LeaveListResponse)
async def my_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await get_leave_requests(db, username=current_user.username)
    return LeaveListResponse(
        requests=[LeaveResponse.model_validate(r) for r in result]
    )


@router.get("/all", response_model=LeaveListResponse)
async def all_requests(
    current_user: User = Depends(role_required("manager", "hr")),
    db: AsyncSession = Depends(get_db),
):
    role_filter = "employee" if current_user.role == "manager" else None
    result = await get_leave_requests(db, role_filter=role_filter)
    return LeaveListResponse(
        requests=[LeaveResponse.model_validate(r) for r in result]
    )


@router.put("/{leave_id}/status", response_model=LeaveResponse)
async def update_status(
    leave_id: int,
    body: LeaveStatusUpdate,
    current_user: User = Depends(role_required("manager", "hr")),
    db: AsyncSession = Depends(get_db),
):
    lr = await update_leave_status(db, leave_id, body.status)
    if lr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    return LeaveResponse.model_validate(lr)
