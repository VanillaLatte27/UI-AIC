"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Users,
  Package,
  Camera,
  Search,
  Maximize2,
  Minimize2,
  Clock,
  Phone,
  AlertCircle,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MapMarker {
  id: string
  type: "person" | "item" | "cctv"
  name: string
  description?: string
  location: string
  coordinates: { lat: number; lng: number }
  lastSeen: string
  status: "active" | "inactive" | "found"
  image?: string
  details?: any
}

export function RealTimeMap({ isFullscreen = false }: { isFullscreen?: boolean }) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState({
    person: true,
    item: true,
    cctv: true,
  })
  const [isFullscreenMode, setIsFullscreenMode] = useState(isFullscreen)

  const markers: MapMarker[] = [
    {
      id: "person-1",
      type: "person",
      name: "John Doe",
      location: "Central Market",
      coordinates: { lat: -6.2088, lng: 106.8456 },
      lastSeen: "Mar 12, 2024, 11:20 AM",
      status: "active",
      image: "/missing-person-male.png",
      details: {
        age: 35,
        height: "175 cm",
        reporterPhone: "+62 812-3456-7890",
      },
    },
    {
      id: "person-2",
      type: "person",
      name: "Sarah Wilson",
      location: "Bus Station",
      coordinates: { lat: -6.2, lng: 106.83 },
      lastSeen: "Mar 11, 2024, 3:45 PM",
      status: "active",
      image: "/missing-person-female.png",
      details: {
        age: 28,
        height: "160 cm",
        reporterPhone: "+62 813-9876-5432",
      },
    },
    {
      id: "item-1",
      type: "item",
      name: "Blue Sedan ABC-1234",
      description: "Honda Civic 2020",
      location: "Highway 101",
      coordinates: { lat: -6.195, lng: 106.82 },
      lastSeen: "Mar 12, 10:45 AM",
      status: "active",
      image: "/blue-sedan.png",
      details: {
        licensePlate: "ABC-1234",
        color: "Blue",
        reporterPhone: "+62 814-5555-1234",
      },
    },
    {
      id: "item-2",
      type: "item",
      name: "Red Honda XYZ-5678",
      description: "Motorcycle",
      location: "Shopping Mall",
      coordinates: { lat: -6.215, lng: 106.84 },
      lastSeen: "Mar 10, 2:30 PM",
      status: "active",
      image: "/red-motorcycle.png",
      details: {
        licensePlate: "XYZ-5678",
        color: "Red",
        reporterPhone: "+62 815-7777-8888",
      },
    },
    {
      id: "cctv-1",
      type: "cctv",
      name: "CCTV Pasar Central",
      location: "Central Market - Main Entrance",
      coordinates: { lat: -6.2088, lng: 106.8456 },
      lastSeen: "Online",
      status: "active",
      details: {
        cameraId: "CAM-001",
        coverage: "360° View",
        quality: "4K",
      },
    },
    {
      id: "cctv-2",
      type: "cctv",
      name: "CCTV Highway 101",
      location: "Highway 101 - KM 15",
      coordinates: { lat: -6.195, lng: 106.82 },
      lastSeen: "Online",
      status: "active",
      details: {
        cameraId: "CAM-002",
        coverage: "Traffic Monitoring",
        quality: "HD",
      },
    },
    {
      id: "cctv-3",
      type: "cctv",
      name: "CCTV Mall Entrance",
      location: "Shopping Mall - Parking Area",
      coordinates: { lat: -6.215, lng: 106.84 },
      lastSeen: "Online",
      status: "inactive",
      details: {
        cameraId: "CAM-003",
        coverage: "Parking Surveillance",
        quality: "HD",
      },
    },
  ]

  const filteredMarkers = markers.filter((marker) => {
    const matchesFilter = activeFilters[marker.type]
    const matchesSearch =
      searchQuery === "" ||
      marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const toggleFilter = (type: keyof typeof activeFilters) => {
    setActiveFilters((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.status === "inactive") return "bg-gray-500"
    switch (marker.type) {
      case "person":
        return "bg-cyan-500"
      case "item":
        return "bg-orange-500"
      case "cctv":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "person":
        return Users
      case "item":
        return Package
      case "cctv":
        return Camera
      default:
        return MapPin
    }
  }

  return (
    <div className={cn(
      "bg-slate-900 text-white relative overflow-hidden",
      isFullscreenMode ? "fixed inset-0 z-50 flex flex-col" : "h-full flex flex-col"
    )}>
      {/* Map Header - Only show in fullscreen mode */}
      {isFullscreenMode && (
        <div className="border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                REAL-TIME MAP
              </h2>
              <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Tracking
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreenMode(!isFullscreenMode)}
                className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari lokasi, nama, atau nomor plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilters.person ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("person")}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  activeFilters.person
                    ? "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/25 shadow-lg"
                    : "border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700",
                )}
              >
                <Users className="h-4 w-4" />
                Orang ({markers.filter((m) => m.type === "person").length})
              </Button>
              <Button
                variant={activeFilters.item ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("item")}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  activeFilters.item
                    ? "bg-orange-600 hover:bg-orange-700 shadow-orange-500/25 shadow-lg"
                    : "border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700",
                )}
              >
                <Package className="h-4 w-4" />
                Barang ({markers.filter((m) => m.type === "item").length})
              </Button>
              <Button
                variant={activeFilters.cctv ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("cctv")}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  activeFilters.cctv
                    ? "bg-green-600 hover:bg-green-700 shadow-green-500/25 shadow-lg"
                    : "border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700",
                )}
              >
                <Camera className="h-4 w-4" />
                CCTV ({markers.filter((m) => m.type === "cctv").length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen toggle for embedded mode */}
      {!isFullscreenMode && (
        <div className="absolute top-2 right-2 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreenMode(true)}
            className="border-slate-600 text-slate-300 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 shadow-lg"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={cn("flex flex-1 overflow-hidden", isFullscreenMode ? "h-0" : "")}>
        {/* Mobile/tablet responsive handling */}
        {selectedMarker && !isFullscreenMode && (
          <div className="absolute inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSelectedMarker(null)} />
        )}
        
        {/* Map Area */}
        <div className="flex-1 relative bg-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800">
            <img 
              src="/map.jpg" 
              alt="Interactive map" 
              className="w-full h-full object-cover opacity-90" 
              style={{ 
                filter: 'contrast(1.1) brightness(0.9) saturate(1.2)' 
              }}
            />
            
            {/* Map overlay for better contrast */}
            <div className="absolute inset-0 bg-slate-900/20 pointer-events-none"></div>

            {/* Map Markers */}
            {filteredMarkers.map((marker, index) => {
              const IconComponent = getMarkerIcon(marker.type)
              // Better positioning system using percentage-based layout
              const positions = [
                { left: '25%', top: '35%' }, // Central Market area
                { left: '45%', top: '60%' }, // Bus Station area
                { left: '65%', top: '25%' }, // Highway area
                { left: '30%', top: '70%' }, // Shopping Mall area
                { left: '75%', top: '45%' }, // Additional positions
                { left: '55%', top: '40%' },
                { left: '20%', top: '55%' },
              ]
              const position = positions[index % positions.length]
              
              return (
                <div
                  key={marker.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 group"
                  style={{
                    left: position.left,
                    top: position.top,
                  }}
                  onClick={() => setSelectedMarker(marker)}
                >
                  {/* Marker pulse animation for active markers */}
                  {marker.status === "active" && (
                    <div className={cn(
                      "absolute inset-0 rounded-full animate-ping opacity-75",
                      getMarkerColor(marker)
                    )}></div>
                  )}
                  
                  <div
                    className={cn(
                      "relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-all duration-200",
                      getMarkerColor(marker),
                      selectedMarker?.id === marker.id && "ring-4 ring-white/50 ring-offset-2 ring-offset-slate-700 scale-110",
                      "hover:shadow-xl"
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                    
                    {/* Status indicator */}
                    {marker.status === "inactive" && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md">
                        <div className="w-full h-full bg-red-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Marker label */}
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-slate-800/95 text-white text-xs px-2 py-1 rounded shadow-lg border border-slate-600 whitespace-nowrap">
                      {marker.name}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Enhanced Map Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-slate-600 shadow-xl">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Legend
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-sm"></div>
                <span className="text-slate-300">Orang Hilang</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                <span className="text-slate-300">Barang Hilang</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <span className="text-slate-300">CCTV Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full shadow-sm"></div>
                <span className="text-slate-300">Tidak Aktif</span>
              </div>
            </div>
          </div>
          
          {/* Map Controls */}
          {isFullscreenMode && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 shadow-lg"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Details Panel */}
        {selectedMarker && (
          <div className={cn(
            "border-l border-slate-700 bg-slate-800/95 backdrop-blur-sm overflow-y-auto transition-all duration-300",
            isFullscreenMode ? "w-96" : "w-80",
            "lg:relative lg:translate-x-0",
            !isFullscreenMode && "absolute right-0 top-0 bottom-0 z-40 lg:static lg:z-auto shadow-2xl"
          )}>
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  {getMarkerIcon(selectedMarker.type) && (
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", getMarkerColor(selectedMarker))}>
                      {(() => {
                        const IconComponent = getMarkerIcon(selectedMarker.type)
                        return <IconComponent className="h-3 w-3 text-white" />
                      })()}
                    </div>
                  )}
                  Detail Informasi
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMarker(null)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {selectedMarker.image && (
                <div className="w-full h-36 bg-slate-700 rounded-lg overflow-hidden border border-slate-600 shadow-md">
                  <img
                    src={selectedMarker.image || "/placeholder.svg"}
                    alt={selectedMarker.name}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold text-white text-lg flex items-center gap-2">
                  {selectedMarker.name}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      selectedMarker.status === "active"
                        ? "border-green-500 text-green-400 bg-green-500/10"
                        : "border-red-500 text-red-400 bg-red-500/10",
                    )}
                  >
                    {selectedMarker.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </h4>
                {selectedMarker.description && (
                  <p className="text-slate-400 text-sm leading-relaxed">{selectedMarker.description}</p>
                )}
              </div>

              <div className="space-y-3 py-2">
                <div className="flex items-start gap-3 p-2 bg-slate-700/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-300 text-sm font-medium">Location</span>
                    <p className="text-slate-400 text-xs">{selectedMarker.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 bg-slate-700/50 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-300 text-sm font-medium">Last Seen</span>
                    <p className="text-slate-400 text-xs">{selectedMarker.lastSeen}</p>
                  </div>
                </div>
              </div>

              {selectedMarker.details && Object.keys(selectedMarker.details).length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-700">
                  <h5 className="font-medium text-white text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                    Additional Details
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(selectedMarker.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-slate-700/30 rounded text-sm">
                        <span className="text-slate-400 capitalize font-medium">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </span>
                        <span className="text-slate-300 font-mono text-xs">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {selectedMarker.type === "cctv" ? (
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 shadow-md transition-all duration-200 hover:shadow-lg">
                    <Eye className="h-4 w-4 mr-2" />
                    View Feed
                  </Button>
                ) : (
                  <>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md transition-all duration-200 hover:shadow-lg">
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700 transition-all duration-200"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
