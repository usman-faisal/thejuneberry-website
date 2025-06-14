'use server'

import cloudinary from "@/lib/cloudinary"

export async function uploadToCloudinary(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file provided')
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          resolve(result)
        }
      ).end(buffer)
    })

    return {
      success: true,
      url: (result as any).secure_url,
      public_id: (result as any).public_id
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    }
  }
} 