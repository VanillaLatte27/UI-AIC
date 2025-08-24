"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Brain, Eye, Users, Car, AlertTriangle, CheckCircle, Clock, Zap, Settings, TrendingUp } from "lucide-react"

interface AIMatch {
  id: string
  type: "person" | "vehicle" | "item"
  confidence: number
  location: string
  timestamp: string
  cameraId: string
  status: "pending" | "confirmed" | "false_positive"
  details: {
    name?: string
    description: string
    matchedFeatures: string[]
  }
}

export function AIAnalysisPanel() {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [faceRecognition, setFaceRecognition] = useState(true)
  const [behaviorAnalysis, setBehaviorAnalysis] = useState(true)
  const [vehicleTracking, setVehicleTracking] = useState(true)
  const [crowdAnalysis, setCrowdAnalysis] = useState(false)
  const [recentMatches, setRecentMatches] = useState<AIMatch[]>([])

  // Data real untuk missing persons
  const missingPersons = [
    { id: "MP-001", name: "Fajar", location: "Central Market" },
    { id: "MP-002", name: "akbar", location: "Central Market" }
  ]

  // Simulasi data real dari AI detection
  const generateRealMatches = (): AIMatch[] => {
    const matches: AIMatch[] = []
    
    // Generate matches untuk Fajar dan akbar
    missingPersons.forEach((person, index) => {
      const confidence = 85 + Math.floor(Math.random() * 15) // 85-99%
      const timestamp = new Date(Date.now() - (index * 2 + 1) * 60000).toLocaleTimeString()
      
      matches.push({
        id: `match-${Date.now()}-${index}`,
        type: "person",
        confidence,
        location: "Pasar Central - Entrance",
        timestamp: `${index + 1} min ago`,
        cameraId: "cam-001",
        status: confidence > 90 ? "confirmed" : "pending",
        details: {
          name: person.name,
          description: `AI detection match for missing person ${person.name} at Central Market`,
          matchedFeatures: [
            "Facial recognition",
            "Height estimation", 
            "Clothing pattern",
            "Movement pattern"
          ],
        },
      })
    })

    // Tambah beberapa false positive untuk realism
    if (Math.random() > 0.5) {
      matches.push({
        id: `match-${Date.now()}-fp`,
        type: "person",
        confidence: 75,
        location: "Pasar Central - Food Court",
        timestamp: "3 min ago",
        cameraId: "cam-002",
        status: "false_positive",
        details: {
          name: "Unknown Person",
          description: "Initial match for missing person, later confirmed as different individual",
          matchedFeatures: ["Hair color", "Approximate age", "Clothing style"],
        },
      })
    }

    return matches
  }

  // Update matches setiap 30 detik untuk simulasi real-time
  useEffect(() => {
    const updateMatches = () => {
      setRecentMatches(generateRealMatches())
    }
    
    updateMatches() // Initial load
    const interval = setInterval(updateMatches, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const aiStats = {
    totalAnalyzed: 15420 + Math.floor(Math.random() * 1000),
    matchesFound: recentMatches.length,
    accuracy: 91.2 + (Math.random() * 5),
    processingSpeed: "2.3ms",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 text-yellow-400"
      case "confirmed":
        return "border-green-500 text-green-400"
      case "false_positive":
        return "border-red-500 text-red-400"
      default:
        return "border-slate-500 text-slate-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "false_positive":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "person":
        return <Users className="h-4 w-4 text-cyan-400" />
      case "vehicle":
        return <Car className="h-4 w-4 text-orange-400" />
      case "item":
        return <Eye className="h-4 w-4 text-purple-400" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const handleConfirmMatch = (matchId: string) => {
    setRecentMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, status: "confirmed" as const }
          : match
      )
    )
  }

  const handleFalsePositive = (matchId: string) => {
    setRecentMatches(prev => 
      prev.map(match => 
        match.id === matchId 
          ? { ...match, status: "false_positive" as const }
          : match
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Smart AI Analysis</h2>
            <p className="text-slate-400">Real-time intelligent monitoring and matching</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${aiEnabled ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-white">{aiEnabled ? "AI Active" : "AI Disabled"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Configuration */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-enabled" className="text-white">
                Master AI System
              </Label>
              <Switch id="ai-enabled" checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="face-recognition" className="text-white">
                Face Recognition
              </Label>
              <Switch
                id="face-recognition"
                checked={faceRecognition}
                onCheckedChange={setFaceRecognition}
                disabled={!aiEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="behavior-analysis" className="text-white">
                Behavior Analysis
              </Label>
              <Switch
                id="behavior-analysis"
                checked={behaviorAnalysis}
                onCheckedChange={setBehaviorAnalysis}
                disabled={!aiEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vehicle-tracking" className="text-white">
                Vehicle Tracking
              </Label>
              <Switch
                id="vehicle-tracking"
                checked={vehicleTracking}
                onCheckedChange={setVehicleTracking}
                disabled={!aiEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="crowd-analysis" className="text-white">
                Crowd Analysis
              </Label>
              <Switch
                id="crowd-analysis"
                checked={crowdAnalysis}
                onCheckedChange={setCrowdAnalysis}
                disabled={!aiEnabled}
              />
            </div>

            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-white font-medium mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Accuracy</span>
                    <span className="text-white">{aiStats.accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={aiStats.accuracy} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Analyzed Today</p>
                    <p className="text-white font-medium">{aiStats.totalAnalyzed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Processing Speed</p>
                    <p className="text-white font-medium">{aiStats.processingSpeed}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent AI Matches */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
                          <CardTitle className="text-cyan-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent AI Matches ({recentMatches.length})
              {recentMatches.length > 0 && (
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Live Detection</span>
                </div>
              )}
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMatches.length > 0 ? (
                recentMatches.map((match) => (
                <div key={match.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(match.type)}
                      <div>
                        <h4 className="font-medium text-white">
                          {match.details.name || `${match.type.charAt(0).toUpperCase() + match.type.slice(1)} Match`}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {match.location} • {match.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(match.status)}>
                        {getStatusIcon(match.status)}
                        <span className="ml-1 capitalize">{match.status.replace("_", " ")}</span>
                      </Badge>
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        {match.confidence}% confidence
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">{match.details.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {match.details.matchedFeatures.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-600 text-slate-200">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {match.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleConfirmMatch(match.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-900 bg-transparent"
                          onClick={() => handleFalsePositive(match.id)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          False Positive
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
              ) : (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Eye className="h-12 w-12 text-slate-500" />
                  </div>
                  <h3 className="text-white font-medium mb-2">No Recent Matches</h3>
                  <p className="text-slate-400 text-sm">
                    AI system is monitoring. New matches will appear here when detected.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Matches</p>
                <p className="text-2xl font-bold text-white">{aiStats.matchesFound}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-green-400">
                  {recentMatches.filter((m) => m.status === "confirmed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {recentMatches.filter((m) => m.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Processing Speed</p>
                <p className="text-2xl font-bold text-cyan-400">{aiStats.processingSpeed}</p>
              </div>
              <Zap className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
