from redis import Redis
from rq import Queue
from app.core.config import settings

# Global Redis connection pool
redis_conn = Redis.from_url(settings.REDIS_URL)

# Create a queue specifically for long-running video tasks
video_queue = Queue('video_conversion', connection=redis_conn, default_timeout='4h')

def get_job_info(job_id: str):
    """Retrieve job from RQ."""
    from rq.job import Job
    from rq.exceptions import NoSuchJobError
    try:
        job = Job.fetch(job_id, connection=redis_conn)
        return {
            "id": job.id,
            "status": job.get_status(),
            "progress": job.meta.get("progress", 0),
            "message": job.meta.get("message", ""),
            "result": job.result
        }
    except NoSuchJobError:
        return None
