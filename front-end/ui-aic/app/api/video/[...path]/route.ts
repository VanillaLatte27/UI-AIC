import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const videoPath = params.path.join('/')
    
    // Map video path ke file lokal
    const videoMap: { [key: string]: string } = {
      'Day_Philipine.mp4': 'C:\\Users\\user\\Downloads\\UI-AIC\\AI\\PASAR\\vidio\\Day_Philipine.mp4'
    }

    const localPath = videoMap[videoPath]
    
    if (!localPath) {
      return new NextResponse('Video not found', { status: 404 })
    }

    // Check if file exists
    try {
      await fs.access(localPath)
    } catch {
      return new NextResponse('Video file not found', { status: 404 })
    }

    // Read video file
    const videoBuffer = await fs.readFile(localPath)
    
    // Return video with proper headers
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error serving video:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}



