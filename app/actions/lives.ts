'use server'

import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

interface LiveFormData {
  title: string
  description: string
  date: string
  videoUrl: string
  thumbnail: string
  thumbnail_public_id: string | null
}

export async function getLives() {
  try {
    const lives = await prisma.live.findMany({
      include: {
        articles: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    return { success: true, lives }
  } catch (error) {
    console.error('Error fetching lives:', error)
    return { success: false, error: 'Failed to fetch lives', lives: [] }
  }
}

export async function createLive(data: LiveFormData) {
  try {
    // Validate required fields
    if (!data.title?.trim()) {
      return { success: false, error: 'Live session title is required' }
    }

    if (!data.date) {
      return { success: false, error: 'Date and time is required' }
    }

    // Validate date is not in the past (allow some margin for processing time)
    const selectedDate = new Date(data.date)
    const now = new Date()
    if (selectedDate < new Date(now.getTime() - 60000)) { // 1 minute margin
      return { success: false, error: 'Cannot schedule a live session in the past' }
    }

    // Validate URL if provided
    if (data.videoUrl && data.videoUrl.trim()) {
      try {
        new URL(data.videoUrl.trim())
      } catch {
        return { success: false, error: 'Please enter a valid video URL' }
      }
    }

    const live = await prisma.live.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        date: selectedDate,
        videoUrl: data.videoUrl?.trim() || null,
        thumbnail: data.thumbnail || null,
        thumbnail_public_id: data.thumbnail_public_id,
      },
      include: {
        articles: true
      }
    })

    revalidatePath('/admin/lives')
    revalidatePath('/lives')
    return { success: true, live }
  } catch (error) {
    console.error('Error creating live:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create live session' 
    }
  }
}

export async function updateLive(id: string, data: LiveFormData) {
  try {
    // Validate required fields
    if (!data.title?.trim()) {
      return { success: false, error: 'Live session title is required' }
    }

    if (!data.date) {
      return { success: false, error: 'Date and time is required' }
    }

    // Validate URL if provided
    if (data.videoUrl && data.videoUrl.trim()) {
      try {
        new URL(data.videoUrl.trim())
      } catch {
        return { success: false, error: 'Please enter a valid video URL' }
      }
    }

    // Get the current live to check for thumbnail changes
    const currentLive = await prisma.live.findUnique({ 
      where: { id },
      select: { thumbnail_public_id: true }
    })

    if (!currentLive) {
      return { success: false, error: 'Live session not found' }
    }

    // If thumbnail changed and there was an old one, delete it from Cloudinary
    if (currentLive.thumbnail_public_id && 
        currentLive.thumbnail_public_id !== data.thumbnail_public_id) {
      try {
        await cloudinary.uploader.destroy(currentLive.thumbnail_public_id)
      } catch (error) {
        console.warn(`Failed to delete old thumbnail ${currentLive.thumbnail_public_id}:`, error)
        // Don't fail the update if Cloudinary deletion fails
      }
    }

    const live = await prisma.live.update({
      where: { id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        date: new Date(data.date),
        videoUrl: data.videoUrl?.trim() || null,
        thumbnail: data.thumbnail || null,
        thumbnail_public_id: data.thumbnail_public_id,
      },
      include: {
        articles: true
      }
    })

    revalidatePath('/admin/lives')
    revalidatePath('/lives')
    return { success: true, live }
  } catch (error) {
    console.error('Error updating live:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update live session' 
    }
  }
}

export async function deleteLive(id: string) {
  try {
    // Get the live session to delete its thumbnail from Cloudinary
    const liveToDelete = await prisma.live.findUnique({ 
      where: { id },
      select: { thumbnail_public_id: true, title: true }
    })
    
    if (!liveToDelete) {
      return { success: false, error: 'Live session not found' }
    }

    // Delete the live session (this will automatically unlink articles due to foreign key)
    await prisma.live.delete({
      where: { id }
    })

    // Delete thumbnail from Cloudinary if it exists
    if (liveToDelete.thumbnail_public_id) {
      try {
        await cloudinary.uploader.destroy(liveToDelete.thumbnail_public_id)
      } catch (error) {
        console.warn(`Failed to delete thumbnail ${liveToDelete.thumbnail_public_id}:`, error)
        // Don't fail the deletion if Cloudinary cleanup fails
      }
    }

    revalidatePath('/admin/lives')
    revalidatePath('/lives')
    return { success: true }
  } catch (error) {
    console.error('Error deleting live:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete live session' 
    }
  }
}