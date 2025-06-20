import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge' // Use Edge for better performance

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }
  
  try {
    const response = await fetch(url)
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // Get the content as an ArrayBuffer
    const buffer = await response.arrayBuffer()
    
    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'content-type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=604800', // Cache for 1 week
      },
    })
  } catch (error) {
    console.error('Tile proxy error:', error)
    return new NextResponse('Error fetching tile', { status: 500 })
  }
}
