from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Graceful degradation if DATABASE_URL is somehow invalid or mock
is_placeholder_db = (
    not settings.DATABASE_URL
    or "user:pass" in settings.DATABASE_URL
    or "localhost:5432/dbname" in settings.DATABASE_URL
)

if is_placeholder_db:
    engine = None
    async_session_maker = None
else:
    try:
        engine = create_async_engine(settings.DATABASE_URL, echo=False, connect_args={"timeout": 2})
        async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    except Exception:
        engine = None
        async_session_maker = None


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if not async_session_maker:
        yield None
        return
        
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
