from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.api import resume, auth, users, bookings, feedback, ai
from app.api.ai_sessions import router as ai_sessions_router
from app.modules.video.router import router as video_router

app = FastAPI(title="PrepPilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"data": None, "error": {"message": exc.detail}}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"data": None, "error": {"message": "Validation error", "details": exc.errors()}}
    )

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(bookings.router, prefix="/api", tags=["booking"])
app.include_router(video_router, prefix="/api", tags=["video"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(ai_sessions_router, prefix="/api/ai", tags=["ai-sessions"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
