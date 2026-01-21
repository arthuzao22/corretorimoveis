import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit'

// Validate environment variables at runtime
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY
const PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

export async function GET(request: NextRequest) {
  try {
    if (!PRIVATE_KEY || !PUBLIC_KEY || !URL_ENDPOINT) {
      console.error('ImageKit not configured - missing environment variables')
      return NextResponse.json(
        { error: 'ImageKit not configured' },
        { status: 500 }
      )
    }

    // Use official SDK to generate authentication parameters
    const imagekit = new ImageKit({
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY,
      urlEndpoint: URL_ENDPOINT,
    })

    const authParams = imagekit.getAuthenticationParameters()

    return NextResponse.json(authParams, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('ImageKit auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
