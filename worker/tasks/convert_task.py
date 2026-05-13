import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from rq import get_current_job
from utils.ffmpeg_utils import run_ffmpeg_with_progress

def check_cancelled(job):
    # Check if job was cancelled in Redis
    job.refresh()
    # RQ uses 'canceled' internally
    if job.get_status() == 'canceled' or job.meta.get('cancel_requested'):
        raise Exception("Job was cancelled by the user")

def process_single_file(job, image_path, audio_path, output_dir, file_index, total_files, progress_dict):
    check_cancelled(job)
    
    base_name = os.path.basename(audio_path)
    name_without_ext = os.path.splitext(base_name)[0]
    output_filename = f"{name_without_ext}.mp4"
    output_path = os.path.join(output_dir, output_filename)
    
    def on_progress(p):
        # Update our specific file progress
        progress_dict[file_index] = p
        
        # Calculate overall progress
        total_p = sum(progress_dict.values()) / total_files
        
        # Save meta
        job.meta['progress'] = int(total_p)
        job.meta['message'] = f"Processing {total_files} files... ({int(total_p)}%)"
        job.save_meta()
        
        # Periodically check cancellation
        if p % 10 == 0:
            check_cancelled(job)

    run_ffmpeg_with_progress(image_path, audio_path, output_path, on_progress)
    return output_path

def process_audiobook(job_id, image_path, audio_paths):
    job = get_current_job()
    output_dir = f"/app/outputs/{job_id}"
    os.makedirs(output_dir, exist_ok=True)
    total_files = len(audio_paths)
    
    progress_dict = {i: 0 for i in range(total_files)}
    job.meta['progress'] = 0
    job.meta['message'] = f"Starting concurrent conversion of {total_files} files..."
    job.save_meta()
    
    # Process concurrently using ThreadPool
    # Since FFmpeg runs in subprocesses, it releases the GIL and uses all CPU cores.
    # Max workers limits how many FFmpeg processes run simultaneously.
    max_workers = min(3, total_files)
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        for i, audio_path in enumerate(audio_paths):
            futures.append(
                executor.submit(
                    process_single_file, job, image_path, audio_path, output_dir, i, total_files, progress_dict
                )
            )
            
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                # If one fails or cancels, the exception bubbles up
                job.meta['message'] = f"Error/Cancelled: {str(e)}"
                job.meta['status'] = 'failed'
                job.save_meta()
                raise e

    job.meta['progress'] = 100
    job.meta['message'] = "All files converted successfully!"
    job.save_meta()
    
    return {"status": "success", "output_dir": output_dir, "files_converted": total_files}
