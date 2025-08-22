"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Phone, Calendar, Clock, AlertTriangle, Eye, Share2, PhoneCall } from "lucide-react"

export function MissingPersonReport() {
  const missingPersonsData = [
    {
      id: "MP-001",
      name: "Fajar",
      age: "23",
      gender: "Laki-laki",
      height: "170",
      weight: "65",
      hairColor: "Hitam",
      eyeColor: "Hitam",
      clothing: "Kaos putih, celana jeans hitam, sepatu sneakers putih",
      lastSeenLocation: "Central Market, Jl. Sudirman No. 123, Jakarta Pusat",
      lastSeenDate: "15 Agustus 2024",
      lastSeenTime: "14:30",
      additionalInfo: "Fajar terakhir terlihat sedang berbelanja di Central Market. Biasanya pulang ke rumah sekitar jam 16:00."
    },
         {
       id: "MP-002", 
       name: "akbar",
       age: "26",
       gender: "Laki-laki",
       height: "178",
       weight: "72",
       hairColor: "Hitam",
       eyeColor: "Coklat",
       clothing: "Kemeja biru, celana chino coklat, sepatu formal hitam",
       lastSeenLocation: "Central Market, Jl. Sudirman No. 123, Jakarta Pusat",
       lastSeenDate: "15 Agustus 2024",
       lastSeenTime: "14:30",
       additionalInfo: "akbar terakhir terlihat bersama Fajar di Central Market. Biasanya bekerja di kantor dan pulang sore."
     }
  ]

  const reporterInfo = {
    name: "Siti Nurhaliza",
    phone: "08123456789",
    relation: "Keluarga",
    reportDate: "15 Agustus 2024",
    reportTime: "16:45"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-500 hover:bg-red-600"
      case "found":
        return "bg-green-500 hover:bg-green-600"
      case "investigating":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Masih Dicari"
      case "found":
        return "Ditemukan"
      case "investigating":
        return "Sedang Diselidiki"
      default:
        return "Tidak Diketahui"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
             <div className="text-center mb-8">
         <h1 className="text-3xl font-bold text-white mb-2">Laporan Orang Hilang</h1>
                   <p className="text-slate-400">Fajar & akbar - Central Market</p>
       </div>

       {/* Status Banner */}
       <Card className="bg-slate-800 border-slate-700">
         <CardContent className="pt-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <AlertTriangle className="h-6 w-6 text-red-400" />
               <div>
                 <h2 className="text-xl font-semibold text-white">Status: Masih Dicari</h2>
                 <p className="text-slate-400">2 Orang Hilang - Terakhir terlihat bersama di Central Market</p>
               </div>
             </div>
             <Badge className="bg-red-500 hover:bg-red-600 text-white">
               Masih Dicari
             </Badge>
           </div>
         </CardContent>
       </Card>

             {/* Personal Information */}
       {missingPersonsData.map((person, index) => (
         <Card key={person.id} className="bg-slate-800 border-slate-700">
           <CardHeader>
             <CardTitle className="text-cyan-400 flex items-center gap-2">
               <User className="h-5 w-5" />
               Informasi Pribadi - {person.name}
               <Badge className="ml-2 bg-slate-600 text-white">
                 {person.id}
               </Badge>
             </CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <p className="text-slate-400 text-sm">Nama Lengkap</p>
               <p className="text-white font-semibold">{person.name}</p>
             </div>
             <div>
               <p className="text-slate-400 text-sm">Usia</p>
               <p className="text-white font-semibold">{person.age} tahun</p>
             </div>
             <div>
               <p className="text-slate-400 text-sm">Jenis Kelamin</p>
               <p className="text-white font-semibold">{person.gender}</p>
             </div>
             <div>
               <p className="text-slate-400 text-sm">Tinggi Badan</p>
               <p className="text-white font-semibold">{person.height} cm</p>
             </div>
             <div>
               <p className="text-slate-400 text-sm">Berat Badan</p>
               <p className="text-white font-semibold">{person.weight} kg</p>
             </div>
             <div>
               <p className="text-slate-400 text-sm">Warna Rambut</p>
               <p className="text-white font-semibold">{person.hairColor}</p>
             </div>
             <div>
               <p className="text-slate-400 text-sm">Warna Mata</p>
               <p className="text-white font-semibold">{person.eyeColor}</p>
             </div>
             <div className="md:col-span-2">
               <p className="text-slate-400 text-sm">Pakaian Terakhir</p>
               <p className="text-white font-semibold">{person.clothing}</p>
             </div>
           </CardContent>
         </Card>
       ))}

             {/* Last Seen Information */}
       <Card className="bg-slate-800 border-slate-700">
         <CardHeader>
           <CardTitle className="text-orange-400 flex items-center gap-2">
             <MapPin className="h-5 w-5" />
             Informasi Terakhir Terlihat
           </CardTitle>
         </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="md:col-span-2">
             <p className="text-slate-400 text-sm">Lokasi Terakhir</p>
             <p className="text-white font-semibold">Central Market, Jl. Sudirman No. 123, Jakarta Pusat</p>
           </div>
           <div>
             <p className="text-slate-400 text-sm">Tanggal Terakhir Terlihat</p>
             <p className="text-white font-semibold flex items-center gap-2">
               <Calendar className="h-4 w-4" />
               15 Agustus 2024
             </p>
           </div>
           <div>
             <p className="text-slate-400 text-sm">Waktu Terakhir Terlihat</p>
             <p className="text-white font-semibold flex items-center gap-2">
               <Clock className="h-4 w-4" />
               14:30
             </p>
           </div>
           <div className="md:col-span-2">
             <p className="text-slate-400 text-sm">Catatan</p>
                           <p className="text-white font-semibold">Fajar dan akbar terakhir terlihat bersama sedang berbelanja di Central Market</p>
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
           <div>
             <p className="text-slate-400 text-sm">Nama Pelapor</p>
             <p className="text-white font-semibold">{reporterInfo.name}</p>
           </div>
           <div>
             <p className="text-slate-400 text-sm">Nomor Telepon</p>
             <p className="text-white font-semibold">{reporterInfo.phone}</p>
           </div>
           <div>
             <p className="text-slate-400 text-sm">Hubungan</p>
             <p className="text-white font-semibold">{reporterInfo.relation}</p>
           </div>
           <div>
             <p className="text-slate-400 text-sm">Tanggal Laporan</p>
             <p className="text-white font-semibold">{reporterInfo.reportDate} - {reporterInfo.reportTime}</p>
           </div>
         </CardContent>
       </Card>

       {/* Additional Information */}
       <Card className="bg-slate-800 border-slate-700">
         <CardHeader>
           <CardTitle className="text-yellow-400 flex items-center gap-2">
             <AlertTriangle className="h-5 w-5" />
             Informasi Tambahan
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           {missingPersonsData.map((person) => (
             <div key={person.id} className="border-l-4 border-yellow-400 pl-4">
               <h4 className="font-semibold text-white mb-2">{person.name}</h4>
               <p className="text-white">{person.additionalInfo}</p>
             </div>
           ))}
         </CardContent>
       </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3">
          <Eye className="h-4 w-4 mr-2" />
          Lihat Detail Lengkap
        </Button>
        <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 px-6 py-3">
          <Share2 className="h-4 w-4 mr-2" />
          Bagikan
        </Button>
        <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white px-6 py-3">
          <PhoneCall className="h-4 w-4 mr-2" />
          Hubungi Pelapor
        </Button>
      </div>
    </div>
  )
}
