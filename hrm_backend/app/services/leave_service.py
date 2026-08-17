from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.leave_request import LeaveRequest


async def create_leave_request(
    db: AsyncSession, username: str, role: str, from_date: date, to_date: date, reason: str
) -> LeaveRequest:
    lr = LeaveRequest(
        username=username,
        role=role,
        from_date=from_date,
        to_date=to_date,
        reason=reason,
        status="Pending",
    )
    db.add(lr)
    await db.flush()
    return lr


async def get_leave_requests(
    db: AsyncSession, username: str | None = None, role_filter: str | None = None
) -> list[LeaveRequest]:
    query = select(LeaveRequest).order_by(LeaveRequest.created_at.desc())
    if username:
        query = query.where(LeaveRequest.username == username)
    if role_filter:
        query = query.where(LeaveRequest.role == role_filter)
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_leave_status(
    db: AsyncSession, leave_id: int, new_status: str
) -> LeaveRequest | None:
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == leave_id))
    lr = result.scalar_one_or_none()
    if lr:
        lr.status = new_status
        await db.flush()
    return lr
