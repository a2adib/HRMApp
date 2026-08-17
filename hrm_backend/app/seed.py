import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session, engine, Base
from app.models.user import User
from app.services.auth_service import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if already seeded
        result = await db.execute(select(User).where(User.username == "hr01"))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping.")
            return

        hr = User(username="hr01", password_hash=hash_password("1234"), role="hr")
        mgr = User(username="mgr01", password_hash=hash_password("1234"), role="manager")
        db.add(hr)
        db.add(mgr)
        await db.flush()

        emp = User(
            username="emp02",
            password_hash=hash_password("1234"),
            role="employee",
            manager_id=mgr.id,
        )
        db.add(emp)
        await db.commit()

    print("Database seeded with default users (hr01, mgr01, emp02 / password: 1234)")


if __name__ == "__main__":
    asyncio.run(seed())
