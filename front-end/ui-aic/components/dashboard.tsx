"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Camera, Users, Package, Eye } from "lucide-react"
import { ReportSelector } from "@/components/report-selector"
import { RealTimeMap } from "@/components/real-time-map"
import { CCTVMonitor } from "@/components/cctv-monitor"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"
import Link from "next/link"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showFullMap, setShowFullMap] = useState(false)

  if (showFullMap) {
    return (
      <div className="h-screen">
        <RealTimeMap isFullscreen={true} />
        <Button
          className="absolute top-4 right-4 z-50 bg-slate-800 hover:bg-slate-700"
          onClick={() => setShowFullMap(false)}
        >
          Close Map
        </Button>
      </div>
    )
  }

  const missingPersons = [
    {
      id: 1,
      name: "Fajar",
      lastSeen: "15 Agustus 2024, 14:30",
      location: "Central Market",
      image: "/fajar.jpg",
      status: "active",
    },
    {
      id: 2,
      name: "akbar",
      lastSeen: "15 Agustus 2024, 14:30",
      location: "Central Market",
      image: "/akbar.jpg",
      status: "active",
    },
  ]

  const missingItems = [
    {
      id: 1,
      type: "Vehicle",
      description: "Blue Sedan ABC-1234",
      lastSeen: "Mar 12, 10:45",
      location: "Highway 101",
      image: "/blue-sedan.jpg",
    },
    {
      id: 2,
      type: "Motorcycle",
      description: "Red Honda XYZ-5678",
      lastSeen: "Mar 10, 2:30 PM",
      location: "Shopping Mall",
      image: "/red-motorcycle.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img src="/logo-horizontal.png" alt="Smart Tracker" className="h-12" />
              <nav className="flex space-x-4">
                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  onClick={() => setActiveTab("dashboard")}
                  className="text-white hover:text-cyan-400"
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "reports" ? "default" : "ghost"}
                  onClick={() => setActiveTab("reports")}
                  className="text-white hover:text-cyan-400"
                >
                  Pelaporan
                </Button>
                <Button
                  variant={activeTab === "cctv" ? "default" : "ghost"}
                  onClick={() => setActiveTab("cctv")}
                  className="text-white hover:text-cyan-400"
                >
                  Akses CCTV
                </Button>
                <Button
                  variant={activeTab === "ai" ? "default" : "ghost"}
                  onClick={() => setActiveTab("ai")}
                  className="text-white hover:text-cyan-400"
                >
                  Smart AI
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Orang Hilang</p>
                      <p className="text-2xl font-bold text-white">2</p>
                    </div>
                    <Users className="h-8 w-8 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Barang Hilang</p>
                      <p className="text-2xl font-bold text-white">8</p>
                    </div>
                    <Package className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">CCTV Aktif</p>
                      <p className="text-2xl font-bold text-white">156</p>
                    </div>
                    <Camera className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Missing Persons */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Orang Hilang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {missingPersons.map((person) => (
                  <div key={person.id} className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg">
                    <img
                      src={person.image || "/placeholder.svg"}
                      alt={person.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{person.name}</h3>
                        <Badge 
                          className={person.status === "active" ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"}
                          variant="secondary"
                        >
                          {person.status === "active" ? "Masih Dicari" : "Sedang Diselidiki"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">Last Seen: {person.lastSeen}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {person.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        <Search className="h-4 w-4" />
                      </Button>
                      <Link href="/missing-person-report">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-600 text-orange-400 hover:bg-orange-700 hover:text-white bg-slate-800"
                        >
                          <Eye className="h-7 w-7 text-orange-500" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Missing Items */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Barang Hilang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {missingItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.description}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.description}</h3>
                      <p className="text-sm text-slate-400">Last Seen: {item.lastSeen}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </p>
                    </div>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Real-time Map */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  REAL-TIME MAP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <RealTimeMap />
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-slate-400">Orang</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-400">Kendaraan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-400">CCTV</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 bg-transparent"
                    onClick={() => setShowFullMap(true)}
                  >
                    View Full Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reports" && <ReportSelector />}

        {activeTab === "cctv" && <CCTVMonitor />}

        {activeTab === "ai" && <AIAnalysisPanel />}
      </div>
    </div>
  )
}
