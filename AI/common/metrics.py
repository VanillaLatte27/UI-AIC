"""
Common metrics utilities for Flask AI services
Provides Prometheus metrics and structured logging
"""
import os
import time
import logging
import json
from functools import wraps
from flask import Flask, request, g
from prometheus_flask_exporter import PrometheusMetrics
from prometheus_client import Gauge, Counter, Histogram
import psutil
import threading

# Global metrics instances
g_infer_latency = Gauge('ai_infer_latency_ms', 'Inference latency in milliseconds', ['model', 'camera', 'video_type'])
g_infer_fps = Gauge('ai_infer_fps', 'Stream FPS', ['camera', 'video_type'])
g_class_count = Gauge('ai_detected_objects', 'Objects detected per class', ['model', 'camera', 'label', 'video_type'])
g_confidence_avg = Gauge('ai_confidence_avg', 'Average confidence score', ['model', 'camera', 'label', 'video_type'])
g_gpu_usage = Gauge('ai_gpu_usage_percent', 'GPU usage percentage', ['gpu_id'])
g_cpu_usage = Gauge('ai_cpu_usage_percent', 'CPU usage percentage')
g_memory_usage = Gauge('ai_memory_usage_mb', 'Memory usage in MB')
g_model_version = Gauge('ai_model_version_info', 'Model version info', ['model_name', 'version', 'path'])

# Counters
c_total_detections = Counter('ai_total_detections', 'Total detections made', ['model', 'camera', 'label', 'video_type'])
c_total_frames = Counter('ai_total_frames_processed', 'Total frames processed', ['model', 'camera', 'video_type'])
c_errors = Counter('ai_errors_total', 'Total errors', ['error_type', 'service'])

# Histograms
h_confidence_dist = Histogram('ai_confidence_distribution', 'Distribution of confidence scores', 
                             ['model', 'camera', 'label', 'video_type'], 
                             buckets=(0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0))

class AIMetricsCollector:
    """Collects and manages AI-specific metrics"""
    
    def __init__(self, model_name="unknown", service_name="ai-service"):
        self.model_name = model_name
        self.service_name = service_name
        self.start_time = time.time()
        self.frame_times = []
        self.detection_counts = {}
        self._lock = threading.Lock()
        
        # Start system metrics collection
        self._start_system_metrics()
    
    def _start_system_metrics(self):
        """Start background thread for system metrics collection"""
        def collect_system_metrics():
            while True:
                try:
                    # CPU and Memory
                    g_cpu_usage.set(psutil.cpu_percent())
                    memory = psutil.virtual_memory()
                    g_memory_usage.set(memory.used / 1024 / 1024)  # MB
                    
                    # GPU metrics (if available)
                    try:
                        import GPUtil
                        gpus = GPUtil.getGPUs()
                        for i, gpu in enumerate(gpus):
                            g_gpu_usage.labels(gpu_id=str(i)).set(gpu.load * 100)
                    except ImportError:
                        pass  # GPU monitoring not available
                    
                    time.sleep(5)  # Update every 5 seconds
                except Exception as e:
                    print(f"Error collecting system metrics: {e}")
                    time.sleep(10)
        
        thread = threading.Thread(target=collect_system_metrics, daemon=True)
        thread.start()
    
    def record_inference(self, latency_ms, camera_id="default", video_type="unknown"):
        """Record inference timing"""
        g_infer_latency.labels(
            model=self.model_name, 
            camera=camera_id, 
            video_type=video_type
        ).set(latency_ms)
    
    def record_fps(self, fps, camera_id="default", video_type="unknown"):
        """Record FPS measurement"""
        g_infer_fps.labels(camera=camera_id, video_type=video_type).set(fps)
    
    def record_detections(self, detections, camera_id="default", video_type="unknown"):
        """Record detection results
        
        Args:
            detections: List of dict with keys: class_name, confidence, bbox
        """
        with self._lock:
            # Count detections per class
            class_counts = {}
            confidence_sums = {}
            confidence_counts = {}
            
            for detection in detections:
                class_name = detection.get('class_name', 'unknown')
                confidence = detection.get('confidence', 0.0)
                
                # Count
                class_counts[class_name] = class_counts.get(class_name, 0) + 1
                
                # Confidence tracking
                if class_name not in confidence_sums:
                    confidence_sums[class_name] = 0.0
                    confidence_counts[class_name] = 0
                confidence_sums[class_name] += confidence
                confidence_counts[class_name] += 1
                
                # Record metrics
                c_total_detections.labels(
                    model=self.model_name,
                    camera=camera_id,
                    label=class_name,
                    video_type=video_type
                ).inc()
                
                h_confidence_dist.labels(
                    model=self.model_name,
                    camera=camera_id,
                    label=class_name,
                    video_type=video_type
                ).observe(confidence)
            
            # Update gauges
            for class_name, count in class_counts.items():
                g_class_count.labels(
                    model=self.model_name,
                    camera=camera_id,
                    label=class_name,
                    video_type=video_type
                ).set(count)
                
                # Average confidence
                if confidence_counts[class_name] > 0:
                    avg_conf = confidence_sums[class_name] / confidence_counts[class_name]
                    g_confidence_avg.labels(
                        model=self.model_name,
                        camera=camera_id,
                        label=class_name,
                        video_type=video_type
                    ).set(avg_conf)
    
    def record_frame_processed(self, camera_id="default", video_type="unknown"):
        """Record frame processing"""
        c_total_frames.labels(
            model=self.model_name,
            camera=camera_id,
            video_type=video_type
        ).inc()
    
    def record_error(self, error_type="unknown"):
        """Record error occurrence"""
        c_errors.labels(error_type=error_type, service=self.service_name).inc()
    
    def set_model_info(self, version="unknown", model_path="unknown"):
        """Set model version information"""
        g_model_version.labels(
            model_name=self.model_name,
            version=version,
            path=model_path
        ).set(1)


def setup_structured_logging(service_name="ai-service", log_level=logging.INFO):
    """Setup structured JSON logging"""
    
    class StructuredFormatter(logging.Formatter):
        def format(self, record):
            log_entry = {
                'timestamp': self.formatTime(record, self.datefmt),
                'service': service_name,
                'level': record.levelname,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno
            }
            
            # Add extra fields if present
            if hasattr(record, 'camera_id'):
                log_entry['camera_id'] = record.camera_id
            if hasattr(record, 'model_name'):
                log_entry['model_name'] = record.model_name
            if hasattr(record, 'video_type'):
                log_entry['video_type'] = record.video_type
            if hasattr(record, 'latency_ms'):
                log_entry['latency_ms'] = record.latency_ms
            if hasattr(record, 'fps'):
                log_entry['fps'] = record.fps
            if hasattr(record, 'detections_count'):
                log_entry['detections_count'] = record.detections_count
            
            return json.dumps(log_entry)
    
    # Setup root logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Console handler with structured format
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(StructuredFormatter())
    logger.addHandler(console_handler)
    
    # File handler for persistent logs
    log_dir = "/var/log/app"
    os.makedirs(log_dir, exist_ok=True)
    
    file_handler = logging.FileHandler(f"{log_dir}/{service_name}.log")
    file_handler.setFormatter(StructuredFormatter())
    logger.addHandler(file_handler)
    
    return logger


def setup_flask_metrics(app: Flask, service_name="ai-service", model_name="unknown"):
    """Setup Flask app with Prometheus metrics and health checks"""
    
    # Setup Prometheus metrics
    metrics = PrometheusMetrics(app)
    metrics.info('app_info', 'Application info', version='1.0.0', service=service_name)
    
    # Setup AI metrics collector
    ai_metrics = AIMetricsCollector(model_name=model_name, service_name=service_name)
    
    # Store in app context for access in routes
    app.ai_metrics = ai_metrics
    
    # Health check endpoint
    @app.route('/healthz')
    def health_check():
        """Health check endpoint with detailed status"""
        health_data = {
            'status': 'healthy',
            'service': service_name,
            'model': model_name,
            'timestamp': time.time(),
            'uptime_seconds': time.time() - ai_metrics.start_time,
            'checks': {
                'model_loaded': hasattr(app, 'model') and app.model is not None,
                'streaming': getattr(app, 'is_streaming', False)
            }
        }
        
        # Add system info
        try:
            health_data['system'] = {
                'cpu_percent': psutil.cpu_percent(),
                'memory_mb': psutil.virtual_memory().used / 1024 / 1024,
                'disk_free_gb': psutil.disk_usage('/').free / 1024 / 1024 / 1024
            }
        except Exception as e:
            health_data['system_error'] = str(e)
        
        return health_data, 200
    
    # Metrics endpoint (Prometheus scraping)
    @app.route('/metrics')
    def metrics_endpoint():
        """Prometheus metrics endpoint"""
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}
    
    return ai_metrics


def timing_decorator(metrics_collector, camera_id="default", video_type="unknown"):
    """Decorator to measure inference timing"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                latency_ms = (time.time() - start_time) * 1000
                metrics_collector.record_inference(latency_ms, camera_id, video_type)
                return result
            except Exception as e:
                metrics_collector.record_error(error_type=type(e).__name__)
                raise
        return wrapper
    return decorator
