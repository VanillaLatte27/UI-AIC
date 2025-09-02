import argparse
import os
from pathlib import Path
import tempfile
import cv2
import numpy as np

import torch
from ultralytics import YOLO

try:
    import onnx
    import onnxruntime as ort
    from onnxruntime.quantization import quantize_dynamic, QuantType
except Exception as e:
    raise SystemExit(f"onnx/onnxruntime not installed: {e}")

def export_to_onnx(pt_model_path: Path, onnx_out: Path, imgsz=640, opset=12):
    model = YOLO(str(pt_model_path))
    print(f"Exporting to ONNX: {onnx_out}")
    model.export(format="onnx", imgsz=imgsz, opset=opset, simplify=True)
    exported = pt_model_path.with_suffix('.onnx')
    if exported.exists():
        exported.replace(onnx_out)
    else:
        raise FileNotFoundError(f"ONNX export not found: {exported}")

def find_model_and_videos(base_dir: Path, video_key: str):
    configs = {
        "pasar": {
            "model": base_dir / "PASAR" / "models" / "Day_Philipine.pt",
            "videos": list((base_dir / "PASAR" / "vidio").glob("*.mp4")),
        },
        "dublin": {
            "model": base_dir / "MORN_CITY" / "models" / "Day_Dublin.pt",
            "videos": list((base_dir / "MORN_CITY" / "vidio").glob("*.mp4")),
        },
        "night_city": {
            "model": base_dir / "NIGHT_CITY" / "models" / "Night_Dublin.pt",
            "videos": list((base_dir / "NIGHT_CITY" / "vidio").glob("*.mp4")),
        },
    }
    cfg = configs[video_key]
    return cfg["model"], cfg["videos"]

def quantize_onnx_dynamic(onnx_in: Path, onnx_out: Path):
    print(f"Dynamic quantization: {onnx_in} -> {onnx_out}")
    quantize_dynamic(
        model_input=str(onnx_in),
        model_output=str(onnx_out),
        weight_type=QuantType.QInt8,
        optimize_model=True,
    )

def main():
    parser = argparse.ArgumentParser(description="Export and INT8-quantize YOLO model with video calibration")
    parser.add_argument("--video", choices=["pasar", "dublin", "night_city"], default="pasar")
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--samples", type=int, default=200)
    parser.add_argument("--outdir", type=str, default="export")
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    pt_model, video_paths = find_model_and_videos(base_dir, args.video)
    if not pt_model.exists():
        raise SystemExit(f"Model not found: {pt_model}")
    if not video_paths:
        raise SystemExit("No calibration videos found")

    onnx_fp32 = outdir / f"{pt_model.stem}_fp32.onnx"
    onnx_int8 = outdir / f"{pt_model.stem}_int8.onnx"

    export_to_onnx(pt_model, onnx_fp32, imgsz=args.imgsz)

    quantize_onnx_dynamic(onnx_fp32, onnx_int8)
    print(f"Export complete:\n FP32: {onnx_fp32}\n INT8: {onnx_int8}")

if __name__ == "__main__":
    main()