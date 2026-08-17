from datetime import date, datetime, time

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance


async def mark_attendance(db: AsyncSession, username: str, role: str) -> tuple[bool, str]:
    today = date.today()
    result = await db.execute(
        select(Attendance).where(Attendance.username == username, Attendance.date == today)
    )
    existing = result.scalar_one_or_none()
    if existing:
        return False, "Attendance already marked for today"

    now = datetime.now()
    att = Attendance(username=username, role=role, date=today, time=now.time())
    db.add(att)
    return True, "Attendance marked successfully"


async def get_attendance_logs(db: AsyncSession, username: str | None = None) -> list[Attendance]:
    query = select(Attendance).order_by(Attendance.date.desc())
    if username:
        query = query.where(Attendance.username == username)
    result = await db.execute(query)
    return list(result.scalars().all())


async def export_attendance_csv(db: AsyncSession) -> str:
    logs = await get_attendance_logs(db)
    lines = ["Username,Role,Date,Time"]
    for log in logs:
        lines.append(f"{log.username},{log.role},{log.date},{log.time}")
    return "\n".join(lines)
