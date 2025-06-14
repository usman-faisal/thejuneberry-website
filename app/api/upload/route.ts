import cloudinary from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'articles', // Optional: organize uploads
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Optional: resize
        { quality: 'auto' }, // Optional: optimize quality
        { format: 'auto' } // Optional: auto format
      ]
    })

    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id 
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' }, 
      { status: 500 }
    )
  }
}