import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = request.headers.get('x-api-key')
    const validApiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY

    // If no API key is provided or it doesn't match, return 401
    if (!apiKey || apiKey !== validApiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - Invalid API Key' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
  }
  // Handle admin routes
  if (!request.nextUrl.pathname.startsWith('/admin/login') && request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('adminToken')?.value

    // If no token is present, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET as string)
      await jwtVerify(token, secret)
      
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Continue with the request if no special handling is needed
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
} 