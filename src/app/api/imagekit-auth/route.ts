import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit-javascript'

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_TiW88yZqhiTSzMZJvBq1f+3/9Ig=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_Csw7S9tju66Nhe57zoOGvHGEUm0=',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/gfbi8asbh',
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
