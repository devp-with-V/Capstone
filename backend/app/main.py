from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.api import resume, auth, users

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
    """Enforce standard API response shape on all HTTP errors (401, 403, 404, etc.)"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"data": None, "error": {"message": exc.detail}}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Enforce standard API response shape on validation errors (422)"""
    return JSONResponse(
        status_code=422,
        content={"data": None, "error": {"message": f"Validation error: {exc.errors()}"}}
    )

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

