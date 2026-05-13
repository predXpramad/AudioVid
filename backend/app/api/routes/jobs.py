from fastapi import APIRouter, HTTPException
from app.utils.file_utils import delete_job_files
from app.services.queue import redis_conn
from rq.job import Job
from rq.exceptions import NoSuchJobError
from rq.command import send_stop_job_command

router = APIRouter()

@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Cancels and deletes a job and its files."""
    try:
        job = Job.fetch(job_id, connection=redis_conn)
        
        if job.is_queued or job.is_deferred:
            job.cancel()
            job.delete()
        elif job.is_started:
            # Tell the worker to stop processing this job
            send_stop_job_command(redis_conn, job_id)
            # Flag for our custom threadpool logic
            job.meta['cancel_requested'] = True
            job.save_meta()
        else:
            job.delete()
    except NoSuchJobError:
        pass # Already gone or expired from Redis
        
    # Delete files
    delete_job_files(job_id)
        
    return {"message": f"Job {job_id} deleted successfully"}

@router.post("/cleanup")
async def force_cleanup():
    """Trigger a manual cleanup of old temporary files."""
    # Logic to walk through TEMP_DIR and delete old zips, etc.
    # In a full production app, this would check timestamps.
    import os, shutil
    from app.core.config import settings
    
    deleted_count = 0
    if os.path.exists(settings.TEMP_DIR):
        for filename in os.listdir(settings.TEMP_DIR):
            file_path = os.path.join(settings.TEMP_DIR, filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)
                deleted_count += 1
                
    return {"message": "Cleanup executed", "deleted_files": deleted_count}
