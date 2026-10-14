from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Check if DATABASE_URL is configured with real credentials or a placeholder
def is_valid_db_url(url: str | None) -> bool:
    if not url:
        return False
    placeholders = ["@host:", "user:pass", "localhost:5432/dbname", "your-project"]
    if any(p in url for p in placeholders):
        return False
    return True

engine = None
async_session_maker = None

if is_valid_db_url(settings.DATABASE_URL):
    try:
        # statement_cache_size=0: Supabase Supavisor runs in transaction-pool
        # mode, which does not support prepared statements. Harmless for
        # direct connections too, so it stays unconditional.
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            connect_args={"statement_cache_size": 0},
        )
        async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    except Exception:
        engine = None
        async_session_maker = None

async def get_db() -> AsyncGenerator[AsyncSession | None, None]:
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

