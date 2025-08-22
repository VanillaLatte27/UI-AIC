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
import { CalendarIcon, Upload, Package, MapPin, Phone, AlertCircle, Car, Smartphone, Watch } from "lucide-react"
import { cn } from "@/lib/utils"

export function MissingItemForm() {
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
    itemType: "",
    itemName: "",
    brand: "",
    model: "",
    color: "",
    serialNumber: "",
    licensePlate: "",
    description: "",
    estimatedValue: "",
    lastSeenLocation: "",
    lastSeenTime: "",
    reporterName: "",
    reporterPhone: "",
    reporterRelation: "",
    additionalInfo: "",
    photo: null as File | null,
  })

  const itemTypes = [
    { value: "vehicle", label: "Kendaraan", icon: Car },
    { value: "electronics", label: "Elektronik", icon: Smartphone },
    { value: "jewelry", label: "Perhiasan", icon: Watch },
    { value: "documents", label: "Dokumen", icon: Package },
    { value: "bag", label: "Tas/Dompet", icon: Package },
    { value: "other", label: "Lainnya", icon: Package },
  ]

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
    console.log("Item report submitted:", formData)
    alert("Laporan barang hilang berhasil dikirim!")
  }

  const selectedItemType = itemTypes.find((type) => type.value === formData.itemType)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Laporan Barang Hilang</h1>
        <p className="text-slate-400">Lengkapi formulir di bawah ini untuk melaporkan barang hilang</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Type Selection */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Jenis Barang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {itemTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.itemType === type.value ? "default" : "outline"}
                    className={cn(
                      "h-20 flex flex-col gap-2",
                      formData.itemType === type.value
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                    )}
                    onClick={() => handleInputChange("itemType", type.value)}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm">{type.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Item Details */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              {selectedItemType && <selectedItemType.icon className="h-5 w-5" />}
              Detail Barang
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-white">
                Nama Barang *
              </Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => handleInputChange("itemName", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: iPhone 14, Honda Civic, Tas Kulit"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-white">
                Merek/Brand
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: Apple, Honda, Louis Vuitton"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-white">
                Model/Tipe
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: Pro Max, Civic Type R"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color" className="text-white">
                Warna *
              </Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: Hitam, Putih, Merah"
                required
              />
            </div>

            {formData.itemType === "vehicle" && (
              <div className="space-y-2">
                <Label htmlFor="licensePlate" className="text-white">
                  Nomor Polisi
                </Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange("licensePlate", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Contoh: B 1234 ABC"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="text-white">
                Nomor Seri/IMEI
              </Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Nomor seri atau IMEI jika ada"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedValue" className="text-white">
                Perkiraan Nilai (Rp)
              </Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Contoh: 5000000"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description" className="text-white">
                Deskripsi Detail
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Deskripsikan ciri-ciri khusus, kerusakan, atau tanda pengenal lainnya"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Last Seen Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
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
                placeholder="Contoh: Parkiran Mall, Jl. Sudirman, Rumah"
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
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Foto Barang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="photo" className="text-white">
                Upload Foto Barang
              </Label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <Label htmlFor="photo" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Klik untuk upload foto</p>
                  <p className="text-slate-400 text-sm">PNG, JPG hingga 10MB</p>
                </Label>
                {formData.photo && <p className="text-purple-400 mt-2">File: {formData.photo.name}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporter Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
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
                Hubungan dengan Barang *
              </Label>
              <Select onValueChange={(value) => handleInputChange("reporterRelation", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Pilih hubungan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="owner">Pemilik</SelectItem>
                  <SelectItem value="family">Keluarga Pemilik</SelectItem>
                  <SelectItem value="friend">Teman</SelectItem>
                  <SelectItem value="witness">Saksi</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
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
                placeholder="Informasi tambahan seperti keadaan saat hilang, dugaan penyebab, atau informasi lain yang relevan"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button type="submit" size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
            Kirim Laporan
          </Button>
        </div>
      </form>
    </div>
  )
}
