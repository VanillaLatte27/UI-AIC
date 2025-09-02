#!/usr/bin/env python3
"""
FastAPI serving container for Vertex AI Endpoints
Optimized for YOLO person detection with ONNX models
"""

import os
import io
import base64
from pathlib import Path
from typing import List, Dict, Any, Optional
import time

import uvicorn
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
from ultralytics import YOLO

# Request/Response models
class DetectionRequest(BaseModel):
    image_base64: str
    target_person: Optional[str] = "Fajar"
    confidence_threshold: Optional[float] = 0.25

class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int

class Detection(BaseModel):
    bbox: BoundingBox
    confidence: float
    class_name: str
    class_id: int

class DetectionResponse(BaseModel):
    detections: List[Detection]
    processing_time_ms: float
    image_width: int
    image_height: int
    model_info: Dict[str, Any]

# Health check models
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    available_classes: Dict[int, str]

# Global model
model = None
model_info = {}

def load_model_from_env():
    """Load YOLO model from environment or default paths"""
    global model, model_info
    
    # Check for model path in environment
    model_path = os.environ.get('MODEL_PATH', '')
    
    if not model_path:
        # Auto-discover model in container
        base_dir = Path('/app')
        
        # Look for ONNX models first
        onnx_candidates = list(base_dir.glob('**/*.onnx'))
        if onnx_candidates:
            model_path = str(onnx_candidates[0])
        else:
            # Fallback to .pt models
            pt_candidates = list(base_dir.glob('**/*.pt'))
            if pt_candidates:
                model_path = str(pt_candidates[0])
    
    if not model_path or not Path(model_path).exists():
        raise RuntimeError(f"Model not found: {model_path}")
    
    print(f"Loading model: {model_path}")
    model = YOLO(model_path)
    
    # Store model info
    model_info = {
        'path': model_path,
        'type': 'onnx' if model_path.endswith('.onnx') else 'pytorch',
        'classes': dict(model.names) if hasattr(model, 'names') else {},
        'device': str(model.device) if hasattr(model, 'device') else 'unknown'
    }
    
    print(f"✅ Model loaded successfully")
    print(f"📋 Available classes: {model_info['classes']}")
    return model

def decode_image(image_base64: str) -> np.ndarray:
    """Decode base64 image to OpenCV format"""
    try:
        # Remove data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_base64)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        
        # Decode image
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
            
        return image
    except Exception as e:
        raise ValueError(f"Invalid image data: {str(e)}")

def get_class_id(target_name: str) -> Optional[int]:
    """Get class ID for target person"""
    if not model or not hasattr(model, 'names'):
        return None
    
    names = model.names
    if isinstance(names, dict):
        for k, v in names.items():
            if str(v).strip().lower() == target_name.strip().lower():
                return int(k)
    return None

# Initialize FastAPI app
app = FastAPI(
    title="YOLO Person Detection API",
    description="Vertex AI endpoint for real-time person detection",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        load_model_from_env()
        print("🚀 FastAPI server ready for Vertex AI")
    except Exception as e:
        print(f"❌ Failed to load model on startup: {e}")
        raise

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint required by Vertex AI"""
    return HealthResponse(
        status="healthy" if model is not None else "unhealthy",
        model_loaded=model is not None,
        available_classes=model_info.get('classes', {})
    )

@app.post("/predict", response_model=DetectionResponse)
async def predict(request: DetectionRequest):
    """Main prediction endpoint for Vertex AI"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start_time = time.perf_counter()
    
    try:
        # Decode image
        image = decode_image(request.image_base64)
        h, w = image.shape[:2]
        
        # Get target class ID
        target_class_id = get_class_id(request.target_person) if request.target_person else None
        
        # Run inference
        infer_kwargs = {
            'conf': request.confidence_threshold,
            'verbose': False
        }
        if target_class_id is not None:
            infer_kwargs['classes'] = [target_class_id]
        
        results = model(image, **infer_kwargs)
        
        # Process results
        detections = []
        if len(results) > 0:
            result = results[0]
            if result.boxes is not None and len(result.boxes) > 0:
                boxes = result.boxes
                class_names = result.names if hasattr(result, 'names') else getattr(model, "names", {})
                
                for box in boxes:
                    cls_id = int(box.cls[0].cpu().numpy())
                    cls_name = class_names.get(cls_id, f"Class {cls_id}")
                    x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                    conf = float(box.conf[0].cpu().numpy())
                    
                    detections.append(Detection(
                        bbox=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                        confidence=conf,
                        class_name=cls_name,
                        class_id=cls_id
                    ))
        
        processing_time = (time.perf_counter() - start_time) * 1000
        
        return DetectionResponse(
            detections=detections,
            processing_time_ms=processing_time,
            image_width=w,
            image_height=h,
            model_info=model_info
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/predict_file")
async def predict_file(
    file: UploadFile = File(...),
    target_person: str = "Fajar",
    confidence_threshold: float = 0.25
):
    """Alternative endpoint that accepts file upload"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read uploaded file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Convert to base64 for reuse of main prediction logic
        _, buffer = cv2.imencode('.jpg', image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Use main prediction endpoint
        request = DetectionRequest(
            image_base64=image_base64,
            target_person=target_person,
            confidence_threshold=confidence_threshold
        )
        
        return await predict(request)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "service": "YOLO Person Detection API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST with base64 image)",
            "predict_file": "/predict_file (POST with file upload)",
            "docs": "/docs"
        },
        "model_info": model_info
    }

if __name__ == "__main__":
    # For local testing
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
