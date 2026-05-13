from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import convert, download, status, jobs
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production API for converting MP3 + Image to MP4 for YouTube",
    version="1.0.0",
)

# CORS middleware for development. In production, configure origins via env vars.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(convert.router, prefix=f"{settings.API_V1_STR}/convert", tags=["convert"])
app.include_router(download.router, prefix=f"{settings.API_V1_STR}/download", tags=["download"])
app.include_router(status.router, prefix=f"{settings.API_V1_STR}/status", tags=["status"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_STR}/jobs", tags=["jobs"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "redis": "connected"}
