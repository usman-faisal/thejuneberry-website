import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // Compare with environment variable
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Invalid password' }, 
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )
    
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}