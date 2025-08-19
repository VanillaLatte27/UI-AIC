<template>
  <div class="container">
    <h1>YOLO Tracking from Video</h1>

    <form @submit.prevent="changeTarget">
      <input v-model="targetName" placeholder="Masukkan nama target" />
      <button type="submit">Ganti Target</button>
    </form>

    <p>Target saat ini: <b>{{ currentTarget }}</b></p>

    <img :src="videoStreamUrl" alt="YOLO Stream" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const targetName = ref('')
const currentTarget = ref('Fajar')
const videoStreamUrl = "http://localhost:5000/video_feed"

async function changeTarget() {
  if (!targetName.value) return
  const res = await fetch("http://localhost:5000/set_target", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: targetName.value })
  })
  const data = await res.json()
  if (res.ok) {
    currentTarget.value = targetName.value
    targetName.value = ''
    alert(data.message)
  } else {
    alert(data.error || "Gagal ganti target")
  }
}
</script>

<style>
body {
  background: #0d0d0d;
  color: white;
  font-family: Arial, sans-serif;
  text-align: center;
}
form {
  margin-bottom: 10px;
}
input {
  padding: 5px;
  border-radius: 5px;
  border: none;
}
button {
  padding: 6px 12px;
  margin-left: 5px;
  border: none;
  background: #00ff99;
  color: black;
  cursor: pointer;
  border-radius: 5px;
}
img {
  margin-top: 20px;
  border: 3px solid #00ff99;
  border-radius: 10px;
  max-width: 90%;
}
</style>
