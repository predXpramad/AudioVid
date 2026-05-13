from fastapi import APIRouter, HTTPException
from app.services.queue import get_job_info

router = APIRouter()

@router.get("/{job_id}")
async def get_status(job_id: str):
    """Gets the status of an RQ job."""
    job_info = get_job_info(job_id)
    if not job_info:
        # If job is not in RQ (maybe expired), but files exist?
        # For simplicity, we just return 404 here
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Translate RQ status to frontend expected status
    status_map = {
        'queued': 'queued',
        'started': 'processing',
        'finished': 'success',
        'failed': 'failed',
        'deferred': 'queued',
        'scheduled': 'queued'
    }
    
    frontend_status = status_map.get(job_info['status'], 'queued')
    
    return {
        "job_id": job_id,
        "status": frontend_status,
        "progress": job_info['progress'],
        "message": job_info['message']
    }
