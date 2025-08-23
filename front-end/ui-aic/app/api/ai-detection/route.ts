import { NextRequest, NextResponse } from 'next/server'

const FLASK_API_URL =
  process.env.FLASK_API_URL ||
  process.env.NEXT_PUBLIC_FLASK_BASE_URL ||
  'http://localhost:5001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { target, action, video } = body

    let response
    let flaskUrl

    switch (action) {
      case 'set_target':
        flaskUrl = `${FLASK_API_URL}/set_target`
        response = await fetch(flaskUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: target }),
        })
        break

      case 'get_target':
        flaskUrl = `${FLASK_API_URL}/get_target`
        response = await fetch(flaskUrl)
        break

      case 'start_stream':
        flaskUrl = `${FLASK_API_URL}/start_stream`
        response = await fetch(flaskUrl)
        break

      case 'set_video':
        flaskUrl = `${FLASK_API_URL}/set_video`
        response = await fetch(flaskUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ video }),
        })
        // After setting video, restart stream to ensure source switches
        if (response.ok) {
          await fetch(`${FLASK_API_URL}/restart_stream`)
        }
        break

      case 'stop_stream':
        flaskUrl = `${FLASK_API_URL}/stop_stream`
        response = await fetch(flaskUrl)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error communicating with Flask API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to communicate with AI detection service',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const response = await fetch(`${FLASK_API_URL}/get_target`)
    
    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error getting target from Flask API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get target from AI detection service',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}



