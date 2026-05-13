import os
import re
import shutil
import zipfile
from fastapi import HTTPException
from app.core.config import settings

def sanitize_filename(filename: str) -> str:
    """Removes path traversals and dangerous characters."""
    filename = os.path.basename(filename)
    filename = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', filename)
    return filename

def create_zip_archive(job_ids: list, output_filename: str) -> str:
    """Creates a zip file containing videos from given job IDs."""
    zip_path = os.path.join(settings.TEMP_DIR, output_filename)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for job_id in job_ids:
            job_output_dir = os.path.join(settings.OUTPUT_DIR, job_id)
            if os.path.exists(job_output_dir):
                for file in os.listdir(job_output_dir):
                    if file.endswith('.mp4'):
                        file_path = os.path.join(job_output_dir, file)
                        # Store in zip without the job_id folder structure
                        zipf.write(file_path, file)
                        
    return zip_path

def delete_job_files(job_id: str):
    """Deletes upload and output directories for a specific job."""
    upload_dir = os.path.join(settings.UPLOAD_DIR, job_id)
    output_dir = os.path.join(settings.OUTPUT_DIR, job_id)
    
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir, ignore_errors=True)
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir, ignore_errors=True)
