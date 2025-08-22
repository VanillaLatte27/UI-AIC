# AI Backend Deployment Guide

## Overview

This guide covers the deployment of the AI backend system for the UI-AIC project. The system consists of a Flask-based AI detection service that uses YOLO models for real-time person tracking across multiple video datasets.

## System Architecture

### Components

1. **Main Flask Application** (`flask_app_combined.py`)
   - Central AI detection service
   - REST API endpoints for video control and target management
   - Real-time video streaming with YOLO object detection
   - Multi-threaded architecture for concurrent processing

2. **Video Datasets**
   - **PASAR**: Philippine market surveillance (Day_Philipine.pt model)
   - **MORN_CITY**: Dublin daytime surveillance (Day_Dublin.pt model)
   - **NIGHT_CITY**: Dublin nighttime surveillance (Night_Dublin.pt model)
   - **PIM**: Additional dataset (PIM.pt model)

3. **Frontend Integration**
   - Next.js frontend communicates via REST API
   - Real-time video streaming endpoint
   - Target person management
   - Video source switching

### Technology Stack

- **Backend**: Python Flask with CORS
- **AI/ML**: Ultralytics YOLO v8
- **Computer Vision**: OpenCV
- **Video Processing**: Multi-threaded with threading locks
- **Frontend**: Next.js with TypeScript
- **Deployment**: Python environment with GPU support recommended

## Prerequisites

### System Requirements

- **OS**: Linux/macOS/Windows
- **Python**: 3.8+
- **RAM**: 8GB+ recommended
- **Storage**: 10GB+ for models and datasets
- **GPU**: NVIDIA GPU recommended for better performance
- **Display**: GUI support for video output (optional for headless)

### Dependencies

```bash
# Core dependencies
pip install flask flask-cors ultralytics opencv-python numpy Pillow

# Optional for GPU acceleration
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Additional dependencies from requirements.txt
pip install -r PASAR/requirements.txt
```

## Local Development Setup

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv ai_env
source ai_env/bin/activate  # Linux/macOS
# or
ai_env\Scripts\activate     # Windows

# Install dependencies
pip install flask flask-cors ultralytics opencv-python numpy Pillow
```

### 2. Project Structure Verification

Ensure your project structure matches:

```
/Users/Acer/Documents/GitHub/UI-AIC/AI/
├── flask_app_combined.py
├── MORN_CITY/
│   ├── models/
│   │   └── Day_Dublin.pt
│   └── vidio/
│       └── Day_Dublin.mp4
├── NIGHT_CITY/
│   ├── models/
│   │   └── Night_Dublin.pt
│   └── vidio/
│       └── Night_Dublin.mp4
├── PASAR/
│   ├── models/
│   │   └── Day_Philipine.pt
│   ├── requirements.txt
│   ├── templates/
│   │   └── index.html
│   └── vidio/
│       └── Day_Philipine.mp4
└── PIM/
    ├── models/
    │   └── PIM.pt
    └── vidio/
        └── PIM.mp4
```

### 3. Running the Application

```bash
# Navigate to AI directory
cd /Users/Acer/Documents/GitHub/UI-AIC/AI/

# Run the main application
python flask_app_combined.py
```

The application will start on:
- **Main App**: http://localhost:5000
- **Video Stream**: http://localhost:5000/video_feed
- **API Endpoints**: Available at various routes (see API section)

### 4. Testing the Setup

```bash
# Test video streaming
curl http://localhost:5000/video_feed

# Test target setting
curl -X POST http://localhost:5000/set_target \
  -H "Content-Type: application/json" \
  -d '{"name": "Fajar"}'

# Test video switching
curl -X POST http://localhost:5000/set_video \
  -H "Content-Type: application/json" \
  -d '{"video": "pasar"}'
```

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serve frontend interface |
| `/video_feed` | GET | Real-time video stream with YOLO detection |
| `/set_target` | POST | Change target person for tracking |
| `/set_video` | POST | Switch video source and model |
| `/get_target` | GET | Get current target person |
| `/get_video` | GET | Get current video source |
| `/start_stream` | GET | Start video streaming |
| `/stop_stream` | GET | Stop video streaming |
| `/restart_stream` | GET | Restart video streaming |

### Request/Response Examples

#### Set Target
```bash
curl -X POST http://localhost:5000/set_target \
  -H "Content-Type: application/json" \
  -d '{"name": "Fajar"}'
```

Response:
```json
{
  "message": "Target berhasil diubah ke Fajar",
  "target": "Fajar"
}
```

#### Set Video Source
```bash
curl -X POST http://localhost:5000/set_video \
  -H "Content-Type: application/json" \
  -d '{"video": "pasar"}'
```

Response:
```json
{
  "message": "Video berhasil diubah ke pasar",
  "video": "pasar",
  "target": "Fajar"
}
```

## Production Deployment

### Option 1: Docker Deployment

#### Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY PASAR/requirements.txt .
RUN pip install -r requirements.txt
RUN pip install flask flask-cors ultralytics opencv-python

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run application
CMD ["python", "flask_app_combined.py"]
```

#### Docker Commands
```bash
# Build image
docker build -t ui-aic-backend .

# Run container
docker run -p 5000:5000 -v /path/to/models:/app/models ui-aic-backend

# Run with GPU support (if available)
docker run --gpus all -p 5000:5000 ui-aic-backend
```

### Option 2: Cloud Deployment (AWS/Heroku)

#### Heroku Deployment

1. **Create `Procfile`**:
   ```
   web: python flask_app_combined.py
   ```

2. **Create `runtime.txt`**:
   ```
   python-3.9.7
   ```

3. **Deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

#### AWS EC2 Deployment

```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv

# Setup application
git clone <your-repo>
cd UI-AIC/AI
python3 -m venv venv
source venv/bin/activate
pip install -r PASAR/requirements.txt
pip install flask flask-cors ultralytics opencv-python

# Run with Gunicorn (production WSGI server)
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 flask_app_combined:app
```

### Option 3: Systemd Service (Linux)

Create `/etc/systemd/system/ai-backend.service`:

```ini
[Unit]
Description=AI Backend Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/UI-AIC/AI
ExecStart=/path/to/venv/bin/python flask_app_combined.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Service commands:
```bash
sudo systemctl daemon-reload
sudo systemctl start ai-backend
sudo systemctl enable ai-backend
sudo systemctl status ai-backend
```

## Configuration

### Environment Variables

Create a `.env` file in the AI directory:

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=false
HOST=0.0.0.0
PORT=5000

# Model Configuration
DEFAULT_VIDEO=pasar
DEFAULT_TARGET=Fajar

# Performance Settings
MAX_FPS=25
CONFIDENCE_THRESHOLD=0.25
```

### Model Management

The system automatically manages multiple YOLO models:

```python
VIDEO_CONFIGS = {
    "pasar": {
        "base_dir": "PASAR",
        "model_path": "models/Day_Philipine.pt",
        "video_path": "vidio/Day_Philipine.mp4",
        "default_target": "Fajar"
    },
    "dublin": {
        "base_dir": "MORN_CITY",
        "model_path": "models/Day_Dublin.pt",
        "video_path": "vidio/Day_Dublin.mp4",
        "default_target": "Dublin"
    },
    # ... more configs
}
```

## Performance Optimization

### GPU Acceleration

```bash
# Install CUDA-enabled PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Verify GPU usage
python -c "import torch; print(torch.cuda.is_available())"
```

### Memory Management

```python
# In flask_app_combined.py, adjust these settings:
FRAME_RATE = 25  # Reduce for better performance
CONF_THRESHOLD = 0.25  # Adjust detection sensitivity
MAX_DETECTIONS = 10  # Limit simultaneous detections
```

### Threading Optimization

```python
# Thread pool settings
MAX_WORKERS = 4
QUEUE_SIZE = 100
```

## Monitoring and Logging

### Basic Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_backend.log'),
        logging.StreamHandler()
    ]
)
```

### Health Check Endpoint

Add to `flask_app_combined.py`:

```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None,
        'streaming_active': is_streaming
    })
```

## Troubleshooting

### Common Issues

#### 1. Model Loading Errors

**Problem**: `❌ Model not found` or `❌ Error loading model`

**Solutions**:
```bash
# Check model files exist
ls -la */models/*.pt

# Verify model permissions
chmod 644 */models/*.pt

# Test model loading directly
python -c "from ultralytics import YOLO; model = YOLO('PASAR/models/Day_Philipine.pt')"
```

#### 2. Video Loading Errors

**Problem**: `❌ Could not open video` or video stream issues

**Solutions**:
```bash
# Check video files
ls -la */vidio/*.mp4

# Test video with OpenCV
python -c "import cv2; cap = cv2.VideoCapture('PASAR/vidio/Day_Philipine.mp4'); print(cap.isOpened())"

# Check codec support
ffmpeg -i video.mp4 -c:v libx264 -c:a aac output.mp4
```

#### 3. Performance Issues

**Problem**: Slow detection or high CPU usage

**Solutions**:
```python
# Reduce frame rate
FRAME_RATE = 15  # Lower from 25

# Increase confidence threshold
CONF_THRESHOLD = 0.4  # Higher from 0.25

# Use GPU if available
device = 'cuda' if torch.cuda.is_available() else 'cpu'
```

#### 4. CORS Issues

**Problem**: Frontend cannot connect to backend

**Solutions**:
```python
# Update CORS settings in flask_app_combined.py
CORS(app, origins=['http://localhost:3000', 'http://your-domain.com'])
```

#### 5. Memory Issues

**Problem**: Application crashes due to memory exhaustion

**Solutions**:
```python
# Add memory monitoring
import psutil

def check_memory():
    memory = psutil.virtual_memory()
    if memory.percent > 80:
        print("⚠️ High memory usage detected")
        # Implement cleanup logic
```

### Debug Mode

Run with debug logging:

```bash
export FLASK_ENV=development
python flask_app_combined.py
```

### Log Analysis

```bash
# View recent logs
tail -f ai_backend.log

# Search for errors
grep "ERROR" ai_backend.log

# Monitor resource usage
htop  # or task manager
```

## Security Considerations

### Production Security

1. **Environment Variables**:
   ```bash
   # Never commit secrets
   SECRET_KEY=your-secret-key-here
   DEBUG=false
   ```

2. **Rate Limiting**:
   ```python
   from flask_limiter import Limiter
   limiter = Limiter(app)
   ```

3. **Input Validation**:
   ```python
   @app.route('/set_target', methods=['POST'])
   @limiter.limit("10 per minute")
   def set_target():
       # Add input sanitization
       pass
   ```

4. **HTTPS**:
   ```python
   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=5000, ssl_context='adhoc')
   ```

### Network Security

- Use firewall rules to restrict access
- Implement API authentication
- Use HTTPS in production
- Regular security updates

## Maintenance

### Backup Strategy

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf ai_backup_$DATE.tar.gz /path/to/UI-AIC/AI/
```

### Update Process

```bash
# Update application
cd /path/to/UI-AIC/AI/
git pull origin main

# Update dependencies
pip install -r requirements.txt --upgrade

# Restart service
sudo systemctl restart ai-backend
```

### Monitoring Commands

```bash
# Check service status
sudo systemctl status ai-backend

# View logs
sudo journalctl -u ai-backend -f

# Check resource usage
ps aux | grep python
top -p $(pgrep python)
```

## Support

For additional support:

1. Check the troubleshooting section above
2. Review application logs
3. Test individual components
4. Verify system requirements
5. Check GitHub issues and documentation

## Contributing

When making changes to the deployment:

1. Test locally first
2. Update documentation
3. Consider security implications
4. Test performance impact
5. Update troubleshooting section if needed
