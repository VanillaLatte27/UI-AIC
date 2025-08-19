# Real-time Person Tracker dengan Model Day_Philipine

Script ini untuk tracking orang tertentu dalam video dengan kecepatan real-time (sesuai detik video).

## File yang Dibutuhkan

- `models/Day_Philipine.pt` - Model YOLO yang sudah dilatih
- `vidio/Day_Philipine.mp4` - Video untuk testing

## Instalasi Dependencies

```bash
py -m pip install -r requirements.txt
py -m pip install ultralytics
```

## Cara Penggunaan

### 1. Simple Real-time Tracker ⭐ RECOMMENDED
```bash
py simple_realtime_tracker.py
```

Script ini akan:
- Menampilkan video dengan kecepatan real-time (sesuai FPS video)
- Fokus pada tracking orang tertentu (default: Fajar)
- Highlight target person dengan warna kuning dan icon 🎯
- Kontrol: 'q'=quit, 'p'=pause, 's'=save frame

### 2. Advanced Real-time Tracker (Dengan fitur lengkap)
```bash
py realtime_person_tracker.py
```

Pilih mode:
- **Mode 1**: Real-time tracking dengan kontrol lengkap
- **Mode 2**: Quick person search (cari semua instance orang tertentu)

Fitur:
- Real-time playback sesuai FPS video
- Target person highlighting
- Change target person on-the-fly ('t' key)
- Time display (MM:SS format)
- Statistics tracking

### 3. Legacy Live Test (Frame-based)
```bash
py simple_live_test.py
```

Script ini akan:
- Menampilkan video dengan deteksi per frame
- Auto-restart video ketika selesai
- Kontrol: 'q'=quit, 'p'=pause, 's'=save frame

## Fitur Utama

### 🎯 Target Person Tracking:
- **Highlight target**: Orang yang dicari ditandai dengan warna kuning dan icon 🎯
- **Customizable target**: Bisa mengubah target person saat runtime
- **Statistics**: Menghitung total deteksi target person

### ⏱️ Real-time Playback:
- **Actual speed**: Video diputar sesuai FPS asli (real-time)
- **Time display**: Menampilkan waktu video dalam format MM:SS
- **Frame delay**: Menghitung delay yang tepat untuk real-time playback

### 🎮 Controls:

#### Simple Real-time Tracker:
- **'q'**: Quit/keluar
- **'p'**: Pause/resume video
- **'s'**: Save current frame

#### Advanced Real-time Tracker:
- **'q'**: Quit
- **'p'**: Pause/resume
- **'s'**: Save frame
- **'r'**: Restart video
- **'t'**: Change target person

## Output

### Real-time Features:
- **Time display**: Menampilkan waktu video (MM:SS)
- **Target highlighting**: Target person ditandai dengan warna kuning
- **Statistics**: Total deteksi target person
- **Real-time speed**: Video diputar sesuai kecepatan asli

### Sample Output:
```
🚀 Starting simple real-time person tracker...
✅ Model loaded: models/Day_Philipine.pt
📹 Video loaded: vidio/Day_Philipine.mp4
   FPS: 29, Duration: 30.9s
🎯 Target person: Fajar
🎮 Controls: 'q'=quit, 'p'=pause, 's'=save frame
🔄 Starting real-time display...
✅ Real-time tracking completed!
   Total Fajar detections: 18
```

## Perbedaan dengan Script Sebelumnya

| Feature | Real-time Tracker | Legacy Live Test |
|---------|------------------|------------------|
| **Speed** | Sesuai FPS video (real-time) | Secepat processing |
| **Target** | Fokus pada orang tertentu | Semua deteksi |
| **Time Display** | MM:SS format | Frame counter |
| **Highlighting** | Target person kuning | Semua hijau |
| **Performance** | Lebih lambat, akurat | Lebih cepat |

## Troubleshooting

1. **Error loading model**: Pastikan file model ada di folder `models/`
2. **Error loading video**: Pastikan file video ada di folder `vidio/`
3. **Display error**: Pastikan sistem mendukung GUI (cv2.imshow)
4. **Slow performance**: Real-time tracker memang lebih lambat karena menunggu FPS
5. **Target not found**: Pastikan nama target person sesuai dengan yang ada di model

## Customization

- Ubah `target_person` untuk mengubah orang yang dicari
- Ubah `conf_threshold` untuk mengatur sensitivity deteksi
- Tambahkan fitur tracking lainnya sesuai kebutuhan 