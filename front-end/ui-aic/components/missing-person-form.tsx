"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, User, MapPin, Phone, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function MissingPersonForm() {
  const [date, setDate] = useState<Date>()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    hairColor: "",
    eyeColor: "",
    clothing: "",
    lastSeenLocation: "",
    lastSeenTime: "",
    reporterName: "",
    reporterPhone: "",
    reporterRelation: "",
    additionalInfo: "",
    photo: null as File | null,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    alert("Laporan orang hilang berhasil dikirim!")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Laporan Orang Hilang</h1>
        <p className="text-slate-400">Lengkapi formulir di bawah ini untuk melaporkan orang hilang</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Nama Lengkap *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-white">
                Usia *
              </Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Masukkan usia"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-white">
                Jenis Kelamin *
              </Label>
              <Select onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="male">Laki-laki</SelectItem>
                  <SelectItem value="female">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-white">
                Tinggi Badan (cm)
              </Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: 170"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-white">
                Berat Badan (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: 65"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hairColor" className="text-white">
                Warna Rambut
              </Label>
              <Input
                id="hairColor"
                value={formData.hairColor}
                onChange={(e) => handleInputChange("hairColor", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: Hitam, Coklat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eyeColor" className="text-white">
                Warna Mata
              </Label>
              <Input
                id="eyeColor"
                value={formData.eyeColor}
                onChange={(e) => handleInputChange("eyeColor", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: Hitam, Coklat"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="clothing" className="text-white">
                Pakaian Terakhir
              </Label>
              <Textarea
                id="clothing"
                value={formData.clothing}
                onChange={(e) => handleInputChange("clothing", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Deskripsikan pakaian yang terakhir dikenakan"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Last Seen Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informasi Terakhir Terlihat
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastSeenLocation" className="text-white">
                Lokasi Terakhir *
              </Label>
              <Input
                id="lastSeenLocation"
                value={formData.lastSeenLocation}
                onChange={(e) => handleInputChange("lastSeenLocation", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: Pasar Central, Jl. Sudirman"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Tanggal Terakhir Terlihat *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                      !date && "text-slate-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDate(date) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="bg-slate-700 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastSeenTime" className="text-white">
                Waktu Terakhir *
              </Label>
              <Input
                id="lastSeenTime"
                type="time"
                value={formData.lastSeenTime}
                onChange={(e) => handleInputChange("lastSeenTime", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Foto Orang Hilang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="photo" className="text-white">
                Upload Foto Terbaru
              </Label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <Label htmlFor="photo" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Klik untuk upload foto</p>
                  <p className="text-slate-400 text-sm">PNG, JPG hingga 10MB</p>
                </Label>
                {formData.photo && <p className="text-green-400 mt-2">File: {formData.photo.name}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporter Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informasi Pelapor
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporterName" className="text-white">
                Nama Pelapor *
              </Label>
              <Input
                id="reporterName"
                value={formData.reporterName}
                onChange={(e) => handleInputChange("reporterName", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Nama lengkap pelapor"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reporterPhone" className="text-white">
                Nomor Telepon *
              </Label>
              <Input
                id="reporterPhone"
                type="tel"
                value={formData.reporterPhone}
                onChange={(e) => handleInputChange("reporterPhone", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: 08123456789"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="reporterRelation" className="text-white">
                Hubungan dengan Orang Hilang *
              </Label>
              <Select onValueChange={(value) => handleInputChange("reporterRelation", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Pilih hubungan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="family">Keluarga</SelectItem>
                  <SelectItem value="friend">Teman</SelectItem>
                  <SelectItem value="colleague">Rekan Kerja</SelectItem>
                  <SelectItem value="neighbor">Tetangga</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Informasi Tambahan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-white">
                Keterangan Tambahan
              </Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Informasi tambahan yang mungkin membantu pencarian (kondisi kesehatan, kebiasaan, dll.)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button type="submit" size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-lg">
            Kirim Laporan
          </Button>
        </div>
      </form>
    </div>
  )
}
