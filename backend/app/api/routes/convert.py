from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List
import os
import uuid
import aiofiles
from app.core.config import settings
from app.core.logger import get_logger
from app.utils.file_utils import sanitize_filename
from app.services.queue import video_queue

logger = get_logger(__name__)
router = APIRouter()

@router.post("/")
async def start_conversion(
    audio_files: List[UploadFile] = File(...),
    image: UploadFile = File(...)
):
    # Validate files
    if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type.")
    
    # We must have at least one audio file
    if not audio_files:
        raise HTTPException(status_code=400, detail="No audio files provided.")
        
    for audio in audio_files:
        if audio.content_type not in settings.ALLOWED_AUDIO_TYPES and not audio.filename.endswith(('.mp3', '.m4a', '.wav')):
            raise HTTPException(status_code=400, detail=f"Invalid audio type for {audio.filename}")

    job_id = str(uuid.uuid4())
    upload_dir = os.path.join(settings.UPLOAD_DIR, job_id)
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save Image efficiently
    image_filename = sanitize_filename(image.filename)
    image_path = os.path.join(upload_dir, image_filename)
    async with aiofiles.open(image_path, 'wb') as out_file:
        while content := await image.read(1024 * 1024):  # 1MB chunks
            await out_file.write(content)
            
    # Save Audio files efficiently
    audio_paths = []
    for audio in audio_files:
        audio_filename = sanitize_filename(audio.filename)
        path = os.path.join(upload_dir, audio_filename)
        async with aiofiles.open(path, 'wb') as out_file:
            while content := await audio.read(1024 * 1024):
                await out_file.write(content)
        audio_paths.append(path)
        
    # Enqueue task to RQ worker
    # Ensure tasks module exists in worker!
    job = video_queue.enqueue(
        'tasks.convert_task.process_audiobook',
        args=(job_id, image_path, audio_paths),
        job_id=job_id # explicitly set ID to our generated UUID
    )
    
    logger.info(f"Enqueued job {job.id} with {len(audio_paths)} files.")
    
    return {"job_id": job.id, "message": "Conversion started", "status": "queued"}
