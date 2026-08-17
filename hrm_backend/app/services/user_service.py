from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.auth_service import hash_password


async def get_users(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User).order_by(User.username))
    return list(result.scalars().all())


async def add_user(
    db: AsyncSession, username: str, password: str, role: str, manager_id: int | None = None
) -> User:
    user = User(
        username=username,
        password_hash=hash_password(password),
        role=role,
        manager_id=manager_id,
    )
    db.add(user)
    await db.flush()
    return user


async def get_employees_by_manager(db: AsyncSession, manager_username: str) -> list[User]:
    result = await db.execute(
        select(User).where(User.manager_id.isnot(None))
    )
    all_users = result.scalars().all()

    # Get the manager's user record to find their id
    mgr_result = await db.execute(select(User).where(User.username == manager_username))
    manager = mgr_result.scalar_one_or_none()
    if manager is None:
        return []

    result = await db.execute(
        select(User).where(User.manager_id == manager.id)
    )
    return list(result.scalars().all())
