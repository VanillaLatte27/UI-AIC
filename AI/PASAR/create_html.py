#!/usr/bin/env python3
# -*- coding: utf-8 -*-

html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YOLO Person Tracker</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh; overflow-x: hidden; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; position: relative; }
        .header h1 { font-size: 3.5rem; font-weight: 700; background: linear-gradient(45deg, #00ff99, #00ccff, #ff6b6b); background-size: 200% 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: gradientShift 3s ease-in-out infinite; margin-bottom: 10px; text-shadow: 0 0 30px rgba(0, 255, 153, 0.3); }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .header p { color: #b0b0b0; font-size: 1.1rem; margin-bottom: 20px; }
        .controls { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
        .form-container { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
        .input-group { position: relative; flex: 1; max-width: 400px; }
        input { width: 100%; padding: 15px 20px; border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 15px; background: rgba(255, 255, 255, 0.05); color: white; font-size: 16px; transition: all 0.3s ease; backdrop-filter: blur(10px); }
        input:focus { outline: none; border-color: #00ff99; box-shadow: 0 0 20px rgba(0, 255, 153, 0.3); transform: translateY(-2px); }
        input::placeholder { color: #888; }
        .btn { padding: 15px 30px; border: none; background: linear-gradient(45deg, #00ff99, #00cc7a); color: #000; cursor: pointer; border-radius: 15px; font-size: 16px; font-weight: 600; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 255, 153, 0.3); }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0, 255, 153, 0.4); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .target-info { text-align: center; font-size: 1.2rem; margin: 20px 0; padding: 15px; background: rgba(0, 255, 153, 0.1); border-radius: 15px; border: 1px solid rgba(0, 255, 153, 0.2); }
        .target-info b { color: #00ff99; font-weight: 700; text-shadow: 0 0 10px rgba(0, 255, 153, 0.5); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 25px 0; }
        .stat-item { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 20px; text-align: center; transition: transform 0.3s ease; }
        .stat-item:hover { transform: translateY(-5px); }
        .stat-value { font-size: 2.5rem; font-weight: 700; color: #00ff99; text-shadow: 0 0 15px rgba(0, 255, 153, 0.5); margin-bottom: 5px; }
        .stat-label { font-size: 0.9rem; color: #b0b0b0; text-transform: uppercase; letter-spacing: 1px; }
        .status { margin: 20px 0; padding: 15px 20px; border-radius: 15px; font-weight: 600; text-align: center; animation: slideIn 0.5s ease; }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .status.success { background: linear-gradient(45deg, #00ff99, #00cc7a); color: #000; box-shadow: 0 4px 15px rgba(0, 255, 153, 0.3); }
        .status.error { background: linear-gradient(45deg, #ff4444, #cc3333); color: white; box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3); }
        .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(0, 255, 153, 0.3); border-radius: 50%; border-top-color: #00ff99; animation: spin 1s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .video-container { position: relative; margin-top: 30px; text-align: center; }
        .video-stream { border: 3px solid #00ff99; border-radius: 20px; max-width: 100%; height: auto; box-shadow: 0 0 40px rgba(0, 255, 153, 0.4); transition: all 0.3s ease; }
        .video-stream:hover { transform: scale(1.02); box-shadow: 0 0 60px rgba(0, 255, 153, 0.6); }
        .video-overlay { position: absolute; top: 20px; left: 20px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); padding: 10px 15px; border-radius: 10px; color: white; font-size: 0.9rem; }
        @media (max-width: 768px) { .container { padding: 15px; } .header h1 { font-size: 2.5rem; } .form-container { flex-direction: column; } .input-group { max-width: 100%; } .stats { grid-template-columns: 1fr; } }
        .floating-particles { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1; }
        .particle { position: absolute; width: 2px; height: 2px; background: #00ff99; border-radius: 50%; animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; } 50% { transform: translateY(-20px) rotate(180deg); opacity: 1; } }
    </style>
</head>
<body>
    <div id="app">
        <div class="floating-particles">
            <div v-for="i in 20" :key="i" class="particle" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: Math.random() * 6 + 's', animationDuration: (Math.random() * 3 + 3) + 's' }"></div>
        </div>
        <div class="container">
            <div class="header">
                <h1>🎯 AI Person Tracker</h1>
                <p>Real-time YOLO Detection with Dynamic Target Switching</p>
            </div>
            <div class="controls">
                <div class="form-container">
                    <div class="input-group">
                        <input v-model="targetName" placeholder="Masukkan nama target (contoh: Fajar, Aulia, James, Farhan)" :disabled="loading" />
                    </div>
                    <button class="btn" type="button" @click="changeTarget" :disabled="loading">
                        <span v-if="loading" class="loading"></span>
                        <span v-else>🎯 Ganti Target</span>
                    </button>
                </div>
                <div class="target-info">
                    <span>Target saat ini: <b>{{ currentTarget }}</b></span>
                </div>
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-value">{{ detectionCount }}</div>
                        <div class="stat-label">Detections</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ currentTime }}</div>
                        <div class="stat-label">Current Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ fps }}</div>
                        <div class="stat-label">FPS</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">🎯</div>
                        <div class="stat-label">Active</div>
                    </div>
                </div>
            </div>
            <div v-if="status && status.message" :class="['status', status.type]">
                {{ status.message }}
            </div>
            <div class="video-container">
                <img :src="videoStreamUrl" alt="YOLO Video Stream" class="video-stream" @load="onVideoLoad" @error="onVideoError" />
                <div class="video-overlay">Live Detection Stream</div>
            </div>
        </div>
    </div>
    <script>
        const { createApp, ref, onMounted, onUnmounted } = Vue;
        createApp({
            setup() {
                const targetName = ref(''); const currentTarget = ref('Fajar'); const loading = ref(false); const status = ref(null); const detectionCount = ref(0); const currentTime = ref('00:00'); const fps = ref(0);
                const videoStreamUrl = "https://backendsmart.muhammadhaggy.com/video_feed";
                let fpsCounter = 0; let fpsTimer = null;
                async function changeTarget() {
                    if (!targetName.value.trim()) { showStatus('Nama target tidak boleh kosong', 'error'); return; }
                    loading.value = true; showStatus('Mengubah target...', 'success');
                    try {
                        const response = await fetch("https://backendsmart.muhammadhaggy.com/set_target", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: targetName.value.trim() }) });
                        const data = await response.json();
                        if (response.ok) { currentTarget.value = targetName.value.trim(); targetName.value = ''; showStatus(data.message, 'success'); detectionCount.value = 0; } else { showStatus(data.error || "Gagal mengubah target", 'error'); }
                    } catch (error) { showStatus('Error koneksi ke server', 'error'); console.error('Error:', error); } finally { loading.value = false; }
                }
                function showStatus(message, type = 'success') { status.value = { message, type }; setTimeout(() => { status.value = null; }, 3000); }
                function onVideoLoad() { showStatus('Video stream berhasil dimuat', 'success'); startFPSCounter(); }
                function onVideoError() { showStatus('Error memuat video stream', 'error'); }
                function startFPSCounter() { fpsCounter = 0; if (fpsTimer) clearInterval(fpsTimer); fpsTimer = setInterval(() => { fps.value = fpsCounter; fpsCounter = 0; }, 1000); }
                function updateTime() { const now = new Date(); currentTime.value = now.toLocaleTimeString(); }
                function updateFPS() { fpsCounter++; }
                onMounted(() => {
                    setInterval(updateTime, 1000);
                    setInterval(() => { if (Math.random() > 0.7) { detectionCount.value++; } }, 2000);
                });
                onUnmounted(() => { if (fpsTimer) clearInterval(fpsTimer); });
                return { targetName, currentTarget, loading, status, detectionCount, currentTime, fps, videoStreamUrl, changeTarget, onVideoLoad, onVideoError };
            }
        }).mount('#app');
    </script>
</body>
</html>'''

# Write the HTML content to file with UTF-8 encoding
with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ HTML template created successfully with UTF-8 encoding!") 