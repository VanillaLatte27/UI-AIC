"use client"
import { useEffect, useState } from 'react'

export default function AIMonitoringPage() {
  const [metrics, setMetrics] = useState<string>('Loading metrics...')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let active = true
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics', { cache: 'no-store' })
        const text = await res.text()
        if (active) setMetrics(text)
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load metrics')
      }
    }
    fetchMetrics()
    const id = setInterval(fetchMetrics, 5000)
    return () => { active = false; clearInterval(id) }
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">AI Monitoring</h1>
      {error && <div className="text-red-500">{error}</div>}
      <pre className="bg-black text-green-400 p-4 rounded overflow-auto max-h-[70vh] text-xs">
        {metrics}
      </pre>
      <div className="text-sm text-gray-500">Tip: Open Grafana at http://localhost:3001 to view dashboards.</div>
    </div>
  )
}


