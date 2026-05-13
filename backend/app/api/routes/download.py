from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from app.core.config import settings
from app.utils.file_utils import create_zip_archive
from pydantic import BaseModel

router = APIRouter()

class ZipDownloadRequest(BaseModel):
    job_ids: list[str]

@router.get("/{job_id}/files")
async def list_job_files(job_id: str):
    """Lists all successfully converted MP4 files for a given job."""
    output_dir = os.path.join(settings.OUTPUT_DIR, job_id)
    if not os.path.exists(output_dir):
        return {"files": []}
        
    files = [f for f in os.listdir(output_dir) if f.endswith('.mp4')]
    return {"files": files}

@router.get("/{job_id}/file/{filename}")
async def download_single_file(job_id: str, filename: str):
    """Downloads a specific MP4 file from a job."""
    file_path = os.path.join(settings.OUTPUT_DIR, job_id, filename)
    
    # Path traversal protection is handled by fastapi implicitly but let's be safe
    if not os.path.exists(file_path) or not file_path.startswith(settings.OUTPUT_DIR):
        raise HTTPException(status_code=404, detail="File not found.")
        
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='video/mp4'
    )

@router.get("/{job_id}/zip")
async def download_job_zip(job_id: str):
    """Downloads all output videos for a single job as a zip file."""
    output_dir = os.path.join(settings.OUTPUT_DIR, job_id)
    
    if not os.path.exists(output_dir) or not os.listdir(output_dir):
        raise HTTPException(status_code=404, detail="No output files found for this job.")
        
    zip_filename = f"audiobooks_{job_id}.zip"
    zip_path = create_zip_archive([job_id], zip_filename)
    
    return FileResponse(
        path=zip_path,
        filename=zip_filename,
        media_type='application/zip'
    )

@router.post("/batch-zip")
async def download_batch_zip(request: ZipDownloadRequest):
    """Downloads outputs from multiple jobs."""
    if not request.job_ids:
        raise HTTPException(status_code=400, detail="No job IDs provided.")
        
    zip_filename = "batch_audiobooks.zip"
    zip_path = create_zip_archive(request.job_ids, zip_filename)
    
    return FileResponse(
        path=zip_path,
        filename=zip_filename,
        media_type='application/zip'
    )
