import subprocess
import os
import re

def get_audio_duration(audio_path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", audio_path
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return float(result.stdout.strip())
    except Exception:
        return 0.0

def run_ffmpeg_with_progress(image_path: str, audio_path: str, output_path: str, progress_callback=None):
    """
    Runs FFmpeg to combine an image and an audio file into an MP4.
    Optimized for extremely fast audiobook processing.
    """
    duration = get_audio_duration(audio_path)
    
    # Check for GPU (NVIDIA) and explicitly test if nvenc works
    has_gpu = False
    try:
        gpu_check = subprocess.run(
            ["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=c=black:s=2x2:d=0.1", "-c:v", "h264_nvenc", "-f", "null", "-"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        if gpu_check.returncode == 0:
            has_gpu = True
    except FileNotFoundError:
        pass

    audio_ext = audio_path.split('.')[-1].lower()
    audio_codec = "copy" if audio_ext in ['mp3', 'm4a', 'aac'] else "aac"

    video_codec = "h264_nvenc" if has_gpu else "libx264"
    preset = "p1" if has_gpu else "ultrafast" # p1 is fastest for nvenc

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-framerate", "1",
        "-i", image_path,
        "-i", audio_path,
        "-c:v", video_codec,
        "-tune", "stillimage" if not has_gpu else "hq", # nvenc doesn't support stillimage tune
        "-c:a", audio_codec,
        "-pix_fmt", "yuv420p",
        "-shortest",
        "-preset", preset,
        "-threads", "4",  # Limit CPU threads to 4 per file to prevent 1000% CPU lockups
        output_path
    ]
    
    # Run the command and capture stderr line by line
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, universal_newlines=True)
    
    # time=00:01:23.45
    time_regex = re.compile(r"time=(\d+):(\d+):(\d+\.\d+)")
    
    last_reported_progress = -1
    
    for line in process.stderr:
        match = time_regex.search(line)
        if match and progress_callback and duration > 0:
            h, m, s = match.groups()
            current_time = float(h) * 3600 + float(m) * 60 + float(s)
            progress = min(100, int((current_time / duration) * 100))
            
            # Avoid spamming Redis too frequently (only update on % change)
            if progress > last_reported_progress:
                progress_callback(progress)
                last_reported_progress = progress
                
    process.wait()
    process.wait()
    if process.returncode != 0:
        print(f"FFmpeg failed with return code {process.returncode}")
        # To see the error, you could optionally read process.stderr if we didn't consume it
        raise Exception("FFmpeg failed to process file. It may be due to unsupported codecs or settings.")
        
    return output_path
