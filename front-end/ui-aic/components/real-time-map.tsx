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
    <div className={cn("bg-slate-900 text-white", isFullscreenMode ? "fixed inset-0 z-50" : "h-full")}>
      {/* Map Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              REAL-TIME MAP
            </h2>
            <Badge variant="outline" className="border-green-500 text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live Tracking
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreenMode(!isFullscreenMode)}
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              {isFullscreenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari lokasi, nama, atau nomor plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeFilters.person ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter("person")}
              className={cn(
                "flex items-center gap-2",
                activeFilters.person
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "border-slate-600 text-slate-300 bg-transparent",
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
                "flex items-center gap-2",
                activeFilters.item
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "border-slate-600 text-slate-300 bg-transparent",
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
                "flex items-center gap-2",
                activeFilters.cctv
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-slate-600 text-slate-300 bg-transparent",
              )}
            >
              <Camera className="h-4 w-4" />
              CCTV ({markers.filter((m) => m.type === "cctv").length})
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Map Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-slate-700">
            <img src="/dark-map-interface.png" alt="Interactive map" className="w-full h-full object-cover" />

            {/* Map Markers */}
            {filteredMarkers.map((marker) => {
              const IconComponent = getMarkerIcon(marker.type)
              return (
                <div
                  key={marker.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${20 + (marker.coordinates.lng + 106.8456) * 200}px`,
                    top: `${100 + (marker.coordinates.lat + 6.2088) * 300}px`,
                  }}
                  onClick={() => setSelectedMarker(marker)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white",
                      getMarkerColor(marker),
                      selectedMarker?.id === marker.id && "ring-2 ring-white ring-offset-2 ring-offset-slate-700",
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  {marker.status === "inactive" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 rounded-lg p-3 border border-slate-600">
            <h4 className="text-sm font-semibold text-white mb-2">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span className="text-slate-300">Orang Hilang</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-slate-300">Barang Hilang</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">CCTV Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-slate-300">Tidak Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {selectedMarker && (
          <div className="w-80 border-l border-slate-700 bg-slate-800">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Detail Informasi</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMarker(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {selectedMarker.image && (
                <div className="w-full h-32 bg-slate-700 rounded-lg overflow-hidden">
                  <img
                    src={selectedMarker.image || "/placeholder.svg"}
                    alt={selectedMarker.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="font-semibold text-white text-lg">{selectedMarker.name}</h4>
                {selectedMarker.description && <p className="text-slate-400 text-sm">{selectedMarker.description}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">{selectedMarker.location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">Last Seen: {selectedMarker.lastSeen}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      selectedMarker.status === "active"
                        ? "border-green-500 text-green-400"
                        : "border-red-500 text-red-400",
                    )}
                  >
                    {selectedMarker.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {selectedMarker.details && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <h5 className="font-medium text-white text-sm">Additional Details</h5>
                  {Object.entries(selectedMarker.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                      <span className="text-slate-300">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedMarker.type === "cctv" ? (
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View Feed
                  </Button>
                ) : (
                  <>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
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
