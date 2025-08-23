# syntax=docker/dockerfile:1
FROM python:3.10-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps for OpenCV and video processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libsm6 libxext6 libgl1 libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application (models and videos included)
COPY . /app

WORKDIR /app
EXPOSE 5001
ENV FLASK_HOST=0.0.0.0 \
    FLASK_PORT=5001 \
    FLASK_DEBUG=false

CMD ["python", "flask_app_combined.py"]
