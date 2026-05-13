FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create a non-root user and group
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install FFmpeg for video processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy worker application code
COPY . .

# Ensure volume directories exist and set ownership
RUN mkdir -p /app/uploads /app/outputs /app/temp && \
    chown -R appuser:appuser /app

# Switch to the non-root user for security
USER appuser

# Start the RQ worker
CMD ["rq", "worker", "video_conversion", "--url", "redis://redis:6379/0"]
