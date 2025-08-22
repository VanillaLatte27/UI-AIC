# AI Detection Integration Guide

## Setup dan Penggunaan

### 1. Menjalankan Flask AI Detection App

**Cara 1: Menggunakan Script Batch (Windows)**
```bash
# Double click file ini
start-flask-ai.bat
```

**Cara 2: Manual Command**
```bash
cd "C:\Users\user\Downloads\UI-AIC\AI\PASAR"
pip install flask flask-cors ultralytics opencv-python numpy
python flask_app.py
```

### 2. Menjalankan Frontend Next.js
```bash
cd "C:\Users\user\Downloads\UI-AIC\front-end\ui-aic"
npm run dev
```

### 3. Menggunakan AI Detection

1. **Buka aplikasi:** http://localhost:3000
2. **Pilih tab:** "Akses CCTV"
3. **Pilih kamera:** "Pasar Central - Entrance"
4. **Di panel AI Features:**
   - Masukkan nama target (Fajar atau akbar)
   - Klik tombol Search untuk memulai AI detection
   - AI akan menggunakan model Day_Philipine.pt
   - Hasil deteksi akan muncul di bagian "AI Detection Results"

## File yang Digunakan

### AI Model & Video
- **Model:** `C:\Users\user\Downloads\UI-AIC\AI\PASAR\models\Day_Philipine.pt`
- **Video:** `C:\Users\user\Downloads\UI-AIC\AI\PASAR\vidio\Day_Philipine.mp4`

### Flask App
- **File:** `C:\Users\user\Downloads\UI-AIC\AI\PASAR\flask_app.py`
- **Port:** 5000
- **Endpoints:**
  - `POST /set_target` - Set target person
  - `GET /get_target` - Get current target
  - `GET /start_stream` - Start AI detection
  - `GET /stop_stream` - Stop AI detection
  - `GET /video_feed` - Video stream with detection

### Next.js Integration
- **API Route:** `/api/ai-detection` - Bridge ke Flask app
- **Video Route:** `/api/video/[...path]` - Video streaming
- **Component:** `components/cctv-monitor.tsx` - CCTV interface

## Troubleshooting

### Flask App Tidak Berjalan
1. Pastikan Python terinstall
2. Install dependencies: `pip install flask flask-cors ultralytics opencv-python numpy`
3. Pastikan file model dan video ada di lokasi yang benar
4. Cek port 5000 tidak digunakan aplikasi lain

### AI Detection Tidak Berfungsi
1. Pastikan Flask app berjalan di port 5000
2. Cek console browser untuk error
3. Pastikan nama target sesuai dengan yang ada di model
4. Cek file model Day_Philipine.pt ada dan valid

### Video Tidak Muncul
1. Pastikan file video ada di lokasi yang benar
2. Cek API route `/api/video/Day_Philipine.mp4`
3. Pastikan format video MP4

## Fitur AI Detection

### Target Persons
- **Fajar** - 23 tahun, Kaos putih, celana jeans hitam
- **akbar** - 26 tahun, Kemeja biru, celana chino coklat

### Detection Features
- Real-time person detection
- Confidence level display
- Timestamp dan lokasi deteksi
- Visual bounding box pada video
- Multiple target support

### Model Information
- **Model:** YOLO (You Only Look Once)
- **File:** Day_Philipine.pt
- **Classes:** Fajar, akbar (sesuai training data)
- **Confidence Threshold:** 0.25
- **Frame Rate:** 25 FPS



