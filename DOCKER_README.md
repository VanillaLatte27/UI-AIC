# Docker Deployment Guide

This guide explains how to deploy the UI-AIC project using Docker Compose, which includes both the AI backend and the frontend.

## Prerequisites

- Docker Engine (20.10+)
- Docker Compose (2.0+)
- At least 8GB RAM
- 10GB+ free disk space

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd UI-AIC
```

### 2. Start the Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f ai-backend
docker-compose logs -f frontend
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **AI Backend**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## Services Overview

### AI Backend Service

- **Port**: 5001 (mapped from container port 5000)
- **Technology**: Python Flask + YOLO
- **Features**:
  - Real-time person tracking
  - Multiple video datasets (PASAR, MORN_CITY, NIGHT_CITY, PIM)
  - REST API endpoints
  - Video streaming with YOLO detection

### Frontend Service

- **Port**: 3000
- **Technology**: Next.js + TypeScript
- **Features**:
  - Modern React UI
  - Real-time AI detection controls
  - Video streaming integration
  - Responsive design

## Configuration

### Environment Variables

The services are configured through environment variables in `docker-compose.yml`:

```yaml
ai-backend:
  environment:
    - FLASK_ENV=production
    - DEFAULT_VIDEO=pasar
    - DEFAULT_TARGET=Fajar

frontend:
  environment:
    - NEXT_PUBLIC_AI_BACKEND_URL=http://ai-backend:5000
```

### Custom Configuration

To customize the deployment, edit `docker-compose.yml`:

```yaml
# Change AI backend port
ports:
  - "8080:5000"  # Expose on port 8080

# Add GPU support
ai-backend:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

## Management Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart ai-backend

# View service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Development Mode

For development with hot reload:

```bash
# Build and run with development settings
docker-compose -f docker-compose.dev.yml up

# Or modify docker-compose.yml to use development images
ai-backend:
  environment:
    - FLASK_ENV=development
    - FLASK_DEBUG=true
```

### Production Deployment

```bash
# Build optimized images
docker-compose build --no-cache

# Deploy with production settings
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale ai-backend=2
```

## Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check service status
docker-compose ps

# View detailed logs
docker-compose logs ai-backend

# Check resource usage
docker stats
```

#### 2. AI Backend Health Check Fails

```bash
# Check if AI backend is responding
curl http://localhost:5000/health

# Check if model files exist
docker-compose exec ai-backend ls -la /app/*/models/

# Verify GPU access (if using GPU)
docker-compose exec ai-backend python -c "import torch; print(torch.cuda.is_available())"
```

#### 3. Frontend Cannot Connect to Backend

```bash
# Check if services are on the same network
docker-compose exec frontend curl http://ai-backend:5000/health

# Verify environment variables
docker-compose exec frontend env | grep NEXT_PUBLIC_AI_BACKEND_URL
```

#### 4. Out of Memory Issues

```bash
# Increase memory limit in docker-compose.yml
ai-backend:
  deploy:
    resources:
      limits:
        memory: 4G
      reservations:
        memory: 2G
```

### Log Analysis

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f ai-backend

# Export logs for analysis
docker-compose logs > deployment_logs.txt
```

## Development Workflow

### Local Development

```bash
# Run only AI backend locally
cd AI
python flask_app_combined.py

# Run only frontend locally
cd front-end/ui-aic
npm run dev
```

### Docker Development

```bash
# Build specific service
docker-compose build ai-backend

# Run with volume mounts for code changes
docker-compose -f docker-compose.dev.yml up

# Debug with shell access
docker-compose exec ai-backend bash
docker-compose exec frontend sh
```

## Production Considerations

### Security

```yaml
# Add security configurations
ai-backend:
  environment:
    - SECRET_KEY=your-secret-key
  networks:
    - internal-network

# Use secrets for sensitive data
secrets:
  flask_secret:
    file: ./secrets/flask_secret.txt
```

### Monitoring

```bash
# Monitor resource usage
docker stats

# Set up health checks
curl -f http://localhost:5000/health || exit 1

# Log aggregation
docker-compose logs --tail=1000 > logs.txt
```

### Backup and Recovery

```bash
# Backup configuration
docker-compose config > docker-compose.backup.yml

# Export images
docker save ui-aic-backend ui-aic-frontend > ui-aic-images.tar

# Backup volumes
docker run --rm -v ui-aic_ai-models:/data -v $(pwd):/backup alpine tar czf /backup/models-backup.tar.gz /data
```

## Performance Optimization

### GPU Support

For GPU acceleration, modify `docker-compose.yml`:

```yaml
ai-backend:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
  environment:
    - NVIDIA_VISIBLE_DEVICES=all
```

### Memory Optimization

```yaml
ai-backend:
  deploy:
    resources:
      limits:
        memory: 4G
        cpus: '2.0'
      reservations:
        memory: 2G
        cpus: '1.0'
```

## Support

For additional support:

1. Check the troubleshooting section above
2. Review Docker and Docker Compose documentation
3. Check GitHub issues for known problems
4. Verify system requirements and resource allocation
5. Test individual components in isolation
