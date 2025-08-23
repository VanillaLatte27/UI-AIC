import { NextResponse } from 'next/server'

export async function GET() {
  const base = process.env.FLASK_API_URL || process.env.NEXT_PUBLIC_FLASK_BASE_URL || 'http://localhost:5001'
  try {
    const res = await fetch(`${base}/metrics`, { cache: 'no-store' })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed to fetch metrics' }, { status: 500 })
  }
}


