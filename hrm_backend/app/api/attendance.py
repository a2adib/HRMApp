from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, role_required
from app.database import get_db
from app.models.user import User
from app.schemas.attendance import AttendanceLogsResponse, AttendanceResponse, MarkAttendanceResponse
from app.services.attendance_service import export_attendance_csv, get_attendance_logs, mark_attendance

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/mark", response_model=MarkAttendanceResponse)
async def mark(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    success, message = await mark_attendance(db, current_user.username, current_user.role)
    return MarkAttendanceResponse(success=success, message=message)


@router.get("/logs", response_model=AttendanceLogsResponse)
async def logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await get_attendance_logs(db, username=current_user.username)
    return AttendanceLogsResponse(
        logs=[AttendanceResponse.model_validate(r) for r in result]
    )


@router.get("/all", response_model=AttendanceLogsResponse)
async def all_logs(
    current_user: User = Depends(role_required("hr")),
    db: AsyncSession = Depends(get_db),
):
    result = await get_attendance_logs(db)
    return AttendanceLogsResponse(
        logs=[AttendanceResponse.model_validate(r) for r in result]
    )


@router.get("/export", response_class=PlainTextResponse)
async def export(
    current_user: User = Depends(role_required("hr")),
    db: AsyncSession = Depends(get_db),
):
    csv = await export_attendance_csv(db)
    return PlainTextResponse(
        csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendance.csv"},
    )
