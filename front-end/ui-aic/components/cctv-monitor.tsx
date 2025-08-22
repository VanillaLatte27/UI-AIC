"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Camera,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  AlertTriangle,
  Eye,
  Users,
  Car,
  Zap,
  Search,
  Brain,
  Target,
} from "lucide-react"

interface CCTVCamera {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "maintenance"
  type: "market" | "transport" | "highway"
  aiFeatures: string[]
  lastActivity?: string
  videoSource?: string
  modelPath?: string
}

interface MissingPerson {
  id: string
  name: string
  age: string
  gender: string
  height: string
  weight: string
  hairColor: string
  eyeColor: string
  clothing: string
  lastSeenLocation: string
  lastSeenDate: string
  lastSeenTime: string
  status: "active" | "found" | "investigating"
}

export function CCTVMonitor() {
  const [selectedCamera, setSelectedCamera] = useState<string>("cam-001")
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [viewMode, setViewMode] = useState<"single" | "quad" | "grid">("single")
  const [isAISearching, setIsAISearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [detectionHistory, setDetectionHistory] = useState<any[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamKey, setStreamKey] = useState<number>(0)

  const missingPersonsPasar: MissingPerson[] = [
    { id: "MP-P-001", name: "Fajar", age: "23", gender: "Laki-laki", height: "170", weight: "65", hairColor: "Hitam", eyeColor: "Hitam", clothing: "Kaos putih, celana jeans hitam, sepatu sneakers putih", lastSeenLocation: "Pasar Central - Entrance", lastSeenDate: "15 Agustus 2024", lastSeenTime: "14:30", status: "active" },
    { id: "MP-P-002", name: "akbar", age: "26", gender: "Laki-laki", height: "178", weight: "72", hairColor: "Hitam", eyeColor: "Coklat", clothing: "Kemeja biru, celana chino coklat, sepatu formal hitam", lastSeenLocation: "Pasar Central - Entrance", lastSeenDate: "15 Agustus 2024", lastSeenTime: "14:30", status: "active" },
  ]

  const missingPersonsNight: MissingPerson[] = [
    { id: "MP-N-001", name: "George", age: "34", gender: "Laki-laki", height: "180", weight: "75", hairColor: "Coklat", eyeColor: "Coklat", clothing: "Jaket hitam, jeans biru", lastSeenLocation: "City Platform A", lastSeenDate: "1 Okt 2025", lastSeenTime: "11:15", status: "active" },
    { id: "MP-N-002", name: "John", age: "29", gender: "Laki-laki", height: "176", weight: "70", hairColor: "Hitam", eyeColor: "Hitam", clothing: "Hoodie abu, celana hitam", lastSeenLocation: "City Platform A", lastSeenDate: "1 Okt 2025", lastSeenTime: "11:20", status: "active" },
    { id: "MP-N-003", name: "Michael", age: "31", gender: "Laki-laki", height: "182", weight: "78", hairColor: "Coklat", eyeColor: "Hijau", clothing: "Kemeja biru, celana beige", lastSeenLocation: "City Platform A", lastSeenDate: "1 Okt 2025", lastSeenTime: "11:25", status: "active" },
    { id: "MP-N-004", name: "Valerina", age: "27", gender: "Perempuan", height: "165", weight: "55", hairColor: "Coklat", eyeColor: "Coklat", clothing: "Dress putih, tas coklat", lastSeenLocation: "City Platform A", lastSeenDate: "1 Okt 2025", lastSeenTime: "11:30", status: "active" },
  ]

  const missingPersons: MissingPerson[] = selectedCamera === "cam-002" ? missingPersonsNight : missingPersonsPasar

  const cameras: CCTVCamera[] = [
    {
      id: "cam-001",
      name: "Pasar Central - Entrance",
      location: "Pasar Central, Pintu Masuk Utama",
      status: "online",
      type: "market",
      aiFeatures: ["Face Recognition", "Crowd Detection", "Suspicious Activity", "Missing Person Detection"],
      lastActivity: "AI Model loaded - Day_Philipine.pt",
      videoSource: "pasar",
      modelPath: "pasar"
    },
    {
      id: "cam-002",
      name: "City - Platform A",
      location: "City, Platform A",
      status: "online",
      type: "transport",
      aiFeatures: ["Vehicle Tracking", "People Counting", "Abandoned Object"],
      lastActivity: "AI Model loaded - Night City",
      videoSource: "night_city",
      modelPath: "night_city",
    },
    {
      id: "cam-003",
      name: "Highway 101 - KM 15",
      location: "Jalan Tol 101, KM 15",
      status: "online",
      type: "highway",
      aiFeatures: ["License Plate Recognition", "Speed Detection", "Traffic Analysis"],
      lastActivity: "Speed violation detected - 1 min ago",
    },
    {
      id: "cam-004",
      name: "Pasar Central - Food Court",
      location: "Pasar Central, Area Food Court",
      status: "maintenance",
      type: "market",
      aiFeatures: ["Face Recognition", "Crowd Detection"],
      lastActivity: "Offline for maintenance",
    },
    {
      id: "cam-005",
      name: "Metro Station - Exit B",
      location: "Stasiun Metro, Pintu Keluar B",
      status: "online",
      type: "transport",
      aiFeatures: ["People Flow Analysis", "Suspicious Behavior"],
      lastActivity: "High crowd density - 3 min ago",
    },
    {
      id: "cam-006",
      name: "Highway 205 - Toll Gate",
      location: "Jalan Tol 205, Gerbang Tol",
      status: "offline",
      type: "highway",
      aiFeatures: ["License Plate Recognition", "Vehicle Classification"],
      lastActivity: "Connection lost - 15 min ago",
    },
  ]

  const selectedCameraData = cameras.find((cam) => cam.id === selectedCamera)

  const startAISearch = async (targetName?: string) => {
    const searchTarget = targetName || searchQuery.trim()
    
    if (!searchTarget) {
      // Jika tidak ada target, tampilkan semua orang hilang
      setIsAISearching(true)
      setSearchResults([])
      
      try {
        // Start AI detection stream untuk semua target
        const startStreamResponse = await fetch('/api/ai-detection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'start_stream'
          }),
        })

        if (!startStreamResponse.ok) {
          throw new Error('Failed to start stream')
        }

        // Simulasi deteksi semua orang hilang
        setTimeout(() => {
          const allResults = missingPersons.map((person, index) => ({
            id: Date.now() + index,
            personName: person.name,
            confidence: 0.85 + (Math.random() * 0.1), // Random confidence 0.85-0.95
            timestamp: new Date().toLocaleTimeString(),
            location: index === 0 ? "Entrance Area" : "Food Court Area",
            image: "/missing-person-male.png",
            status: "detected"
          }))
          setSearchResults(allResults)
          // Simpan ke history
          setDetectionHistory(prev => [...allResults, ...prev.slice(0, 4)]) // Keep last 5
          setIsAISearching(false)
        }, 1500)

      } catch (error) {
        console.error('AI Search error:', error)
        alert('Error: Gagal menjalankan AI detection. Pastikan Flask app berjalan di port 5000.')
        setIsAISearching(false)
      }
      return
    }

    setIsAISearching(true)
    setSearchResults([])
    
    try {
      // Set target person di Flask app
      const setTargetResponse = await fetch('/api/ai-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_target',
          target: searchTarget
        }),
      })

      if (!setTargetResponse.ok) {
        throw new Error('Failed to set target')
      }

      const setTargetData = await setTargetResponse.json()
      console.log('Target set:', setTargetData)

      // Start AI detection stream
      const startStreamResponse = await fetch('/api/ai-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_stream'
        }),
      })

      if (!startStreamResponse.ok) {
        throw new Error('Failed to start stream')
      }

      // Simulasi hasil deteksi untuk target spesifik
      setTimeout(() => {
        const mockResults = [
          {
            id: Date.now(),
            personName: searchTarget,
            confidence: 0.87 + (Math.random() * 0.1),
            timestamp: new Date().toLocaleTimeString(),
            location: "Entrance Area",
            image: "/missing-person-male.png",
            status: "detected"
          }
        ]
        setSearchResults(mockResults)
        // Simpan ke history
        setDetectionHistory(prev => [...mockResults, ...prev.slice(0, 4)]) // Keep last 5
        setIsAISearching(false)
      }, 1000)

    } catch (error) {
      console.error('AI Search error:', error)
      alert('Error: Gagal menjalankan AI detection. Pastikan Flask app berjalan di port 5000.')
      setIsAISearching(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-red-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "market":
        return <Users className="h-4 w-4" />
      case "transport":
        return <Car className="h-4 w-4" />
      case "highway":
        return <Zap className="h-4 w-4" />
      default:
        return <Camera className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "market":
        return "text-cyan-400"
      case "transport":
        return "text-orange-400"
      case "highway":
        return "text-green-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sistem CCTV Smart AI</h1>
          <p className="text-slate-400">Monitor real-time dengan deteksi AI otomatis</p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: "single" | "quad" | "grid") => setViewMode(value)}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="single">Single View</SelectItem>
              <SelectItem value="quad">Quad View</SelectItem>
              <SelectItem value="grid">Grid View</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-600 text-white bg-slate-700 hover:bg-slate-600">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Camera List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Daftar Kamera ({cameras.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCamera === camera.id
                    ? "bg-slate-600 border border-cyan-500"
                    : "bg-slate-700/50 hover:bg-slate-700"
                }`}
                onClick={async () => {
                  setSelectedCamera(camera.id)
                  try {
                    if (camera.videoSource === 'night_city' || camera.videoSource === 'pasar') {
                      await fetch('/api/ai-detection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'set_video', video: camera.videoSource }),
                      })
                      // Force reconnection of MJPEG stream
                      setStreamKey((k) => k + 1)
                    }
                  } catch (e) {
                    console.error('Failed to set video source', e)
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={getTypeColor(camera.type)}>{getTypeIcon(camera.type)}</div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)}`}></div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      camera.status === "online"
                        ? "border-green-500 text-green-400"
                        : camera.status === "offline"
                          ? "border-red-500 text-red-400"
                          : "border-yellow-500 text-yellow-400"
                    }`}
                  >
                    {camera.status}
                  </Badge>
                </div>
                <h4 className="font-medium text-white text-sm mb-1">{camera.name}</h4>
                <p className="text-xs text-slate-400 mb-2">{camera.location}</p>
                {camera.modelPath && (
                  <div className="flex items-center gap-1 mb-1">
                    <Brain className="h-3 w-3 text-purple-400" />
                    <p className="text-xs text-purple-400">
                      AI: {camera.modelPath === 'pasar' ? 'Day_Philipine.pt' : 'Day_Dublin.pt'}
                    </p>
                  </div>
                )}
                {camera.lastActivity && <p className="text-xs text-slate-500">{camera.lastActivity}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Video Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={getTypeColor(selectedCameraData?.type || "")}>
                    {getTypeIcon(selectedCameraData?.type || "")}
                  </div>
                  {selectedCameraData?.name}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(selectedCameraData?.status || "offline")}`}
                  ></div>
                  <span className="text-sm text-slate-400">{selectedCameraData?.status}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Video Display Area */}
              <div className="relative bg-slate-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "16/9" }}>
                {selectedCameraData?.status === "online" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {selectedCameraData.id === "cam-001" || selectedCameraData.id === "cam-002" ? (
                      <div className="w-full h-full">
                        {/* AI Detection Stream */}
                        {isAISearching ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                              <p className="text-cyan-400 font-medium">AI Detection Running...</p>
                              <p className="text-slate-400 text-sm">Searching for: {searchQuery}</p>
                              <p className="text-slate-400 text-xs mt-2">
                                Model: {selectedCameraData?.modelPath === 'pasar' ? 'Day_Philipine.pt' : 'Day_Dublin.pt'}
                              </p>
                              <p className="text-cyan-400 text-xs mt-2">Bounding box will appear in video stream</p>
                            </div>
                          </div>
                        ) : (
                          // Tampilkan stream MJPEG dari Flask agar bounding box terlihat
                          <div key={streamKey} className="relative w-full h-full">
                            <img
                              src={`http://localhost:5000/video_feed?ts=${streamKey}`}
                              alt="AI Detection Stream"
                              className="w-full h-full object-cover"
                            />
                            {searchResults.length > 0 && (
                              <div className="absolute top-2 left-2 bg-green-600 px-3 py-1 rounded-full">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  <span className="text-white text-sm font-medium">AI Active</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <img src="/dark-map-interface.png" alt="CCTV Feed" className="w-full h-full object-cover" />
                    )}
                    
                    {/* AI Model Indicator */}
                    {selectedCameraData.modelPath && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-purple-600 px-3 py-1 rounded-full">
                        <Brain className="h-3 w-3 text-white" />
                        <span className="text-white text-sm font-medium">AI: {selectedCameraData.modelPath === 'pasar' ? 'Day_Philipine.pt' : 'Day_Dublin.pt'}</span>
                      </div>
                    )}
                    
                    {/* Live indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">LIVE</span>
                    </div>
                    
                    {/* Recording indicator */}
                    {isRecording && (
                      <div className="absolute top-12 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-sm">REC</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <AlertTriangle className="h-16 w-16 mb-4" />
                    <p className="text-lg font-medium">Camera {selectedCameraData?.status}</p>
                    <p className="text-sm">{selectedCameraData?.lastActivity}</p>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-white bg-slate-700 hover:bg-slate-600"
                    disabled={selectedCameraData?.status !== "online"}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-white bg-slate-700 hover:bg-slate-600"
                    disabled={selectedCameraData?.status !== "online"}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    className={isRecording ? "" : "border-slate-600 text-white bg-slate-700 hover:bg-slate-600"}
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={selectedCameraData?.status !== "online"}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-white bg-slate-700 hover:bg-slate-600"
                    onClick={() => setIsMuted(!isMuted)}
                    disabled={selectedCameraData?.status !== "online"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-white bg-slate-700 hover:bg-slate-600"
                  disabled={selectedCameraData?.status !== "online"}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Features & Alerts */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Smart AI Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCameraData?.aiFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-white text-sm">{feature}</span>
                <Badge variant="outline" className="border-green-500 text-green-400">
                  Active
                </Badge>
              </div>
            ))}

            {/* Missing Person Search */}
            {(selectedCameraData?.id === "cam-001" || selectedCameraData?.id === "cam-002") && (
              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-cyan-500/30">
                <h4 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Missing Person Detection
                  <span className="text-xs text-slate-400 font-normal">(Click name or Search All)</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                    <Button
                      onClick={() => startAISearch()}
                      disabled={isAISearching}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      title="Search by name"
                    >
                      {isAISearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => startAISearch()}
                      disabled={isAISearching}
                      variant="outline"
                      className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                      title="Search All Missing Persons"
                    >
                      {isAISearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {isAISearching && (
                    <Button
                      onClick={async () => {
                        try {
                          await fetch('/api/ai-detection', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'stop_stream' })
                          })
                                                      setIsAISearching(false)
                            setSearchResults([])
                            // Clear current results but keep history
                        } catch (error) {
                          console.error('Error stopping AI detection:', error)
                        }
                      }}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      Stop AI
                    </Button>
                  )}

                  {/* Missing Persons List */}
                  <div className="space-y-2">
                    {missingPersons.map((person) => (
                      <div 
                        key={person.id} 
                        className={`p-2 rounded border-l-4 cursor-pointer transition-all duration-200 hover:bg-slate-600 ${
                          searchQuery === person.name 
                            ? 'bg-cyan-600/30 border-cyan-500' 
                            : 'bg-slate-600/50 border-red-500 hover:border-cyan-400'
                        }`}
                        onClick={async () => {
                          setSearchQuery(person.name)
                          await startAISearch(person.name)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${
                              searchQuery === person.name ? 'text-cyan-400' : 'text-white'
                            }`}>
                              {person.name}
                            </p>
                            <p className="text-xs text-slate-400">{person.clothing}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              searchQuery === person.name 
                                ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}>
                              {person.status === "active" ? "Masih Dicari" : person.status}
                            </Badge>
                            {searchQuery === person.name && isAISearching && (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-400"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-green-400 text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        AI Detection Results:
                        <Badge className="bg-green-500 text-white text-xs">
                          {searchResults.length} Detection{searchResults.length > 1 ? 's' : ''}
                        </Badge>
                      </h5>
                      <div className="space-y-2">
                        {searchResults.map((result) => (
                          <div key={result.id} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">
                                {result.personName} Detected
                              </span>
                              <Badge className="bg-green-500 text-white text-xs">
                                {(result.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">
                              {result.timestamp} • {result.location}
                            </p>
                            {result.status === "detected" && (
                              <p className="text-xs text-green-400 mt-1">
                                ✅ Bounding box visible in video stream
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Recent AI Matches</h4>
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <div key={result.id} className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-medium">
                          {result.personName} Detected
                        </span>
                        <Badge className="bg-cyan-500 text-white text-xs">
                          {(result.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {result.location} • {result.timestamp}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Bounding box active</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 text-sm font-medium">No Recent Matches</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Start AI detection to see matches
                    </p>
                  </div>
                )}
                
                {/* Historical Matches */}
                {searchResults.length === 0 && detectionHistory.length > 0 && (
                  <>
                    {detectionHistory.slice(0, 3).map((historyItem) => (
                      <div key={historyItem.id} className="p-3 bg-slate-800/50 border border-slate-600 rounded-lg opacity-60">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-sm font-medium">
                            {historyItem.personName} Detected
                          </span>
                          <Badge className="bg-slate-500 text-white text-xs">
                            {(historyItem.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {historyItem.location} • {historyItem.timestamp}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Cameras</p>
                <p className="text-2xl font-bold text-white">{cameras.length}</p>
              </div>
              <Camera className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Online</p>
                <p className="text-2xl font-bold text-green-400">
                  {cameras.filter((c) => c.status === "online").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {cameras.filter((c) => c.status === "maintenance").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">AI Alerts Today</p>
                <p className="text-2xl font-bold text-purple-400">23</p>
              </div>
              <Eye className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
