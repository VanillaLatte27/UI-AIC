"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ArrowLeft } from "lucide-react"
import { MissingPersonForm } from "@/components/missing-person-form"
import { MissingItemForm } from "@/components/missing-item-form"

export function ReportSelector() {
  const [selectedReport, setSelectedReport] = useState<"person" | "item" | null>(null)

  if (selectedReport === "person") {
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelectedReport(null)} className="mb-6 text-white hover:text-cyan-400">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Pilihan Laporan
        </Button>
        <MissingPersonForm />
      </div>
    )
  }

  if (selectedReport === "item") {
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelectedReport(null)} className="mb-6 text-white hover:text-cyan-400">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Pilihan Laporan
        </Button>
        <MissingItemForm />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Buat Laporan</h1>
        <p className="text-slate-400">Pilih jenis laporan yang ingin Anda buat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors"
          onClick={() => setSelectedReport("person")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-cyan-400">Laporan Orang Hilang</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-400 mb-4">Laporkan orang yang hilang atau tidak dapat dihubungi</p>
            <ul className="text-sm text-slate-300 space-y-2 text-left">
              <li>• Informasi pribadi lengkap</li>
              <li>• Deskripsi fisik detail</li>
              <li>• Lokasi terakhir terlihat</li>
              <li>• Upload foto terbaru</li>
            </ul>
            <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700">Buat Laporan Orang Hilang</Button>
          </CardContent>
        </Card>

        <Card
          className="bg-slate-800 border-slate-700 cursor-pointer hover:border-orange-500 transition-colors"
          onClick={() => setSelectedReport("item")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-orange-400">Laporan Barang Hilang</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-400 mb-4">Laporkan kendaraan, elektronik, atau barang berharga yang hilang</p>
            <ul className="text-sm text-slate-300 space-y-2 text-left">
              <li>• Berbagai jenis barang</li>
              <li>• Detail merek dan model</li>
              <li>• Nomor seri/plat nomor</li>
              <li>• Perkiraan nilai barang</li>
            </ul>
            <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700">Buat Laporan Barang Hilang</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
