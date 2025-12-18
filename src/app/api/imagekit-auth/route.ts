import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit-javascript'

// Validate environment variables
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error('IMAGEKIT_PRIVATE_KEY is not defined in environment variables')
}

if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY is not defined in environment variables')
}

if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not defined in environment variables')
}

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
})

export async function GET(request: NextRequest) {
  try {
    const authParams = imagekit.getAuthenticationParameters()
    
    return NextResponse.json(authParams, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
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
