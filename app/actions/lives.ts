'use server'

import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary' // Import cloudinary
import { revalidatePath } from 'next/cache'

interface LiveFormData {
  title: string
  description: string
  date: string
  videoUrl: string
  thumbnail: string
  thumbnail_public_id: string | null // Add this
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
    return { success: false, error: 'Failed to fetch lives' }
  }
}

export async function createLive(data: LiveFormData) {
  try {
    const live = await prisma.live.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        videoUrl: data.videoUrl,
        thumbnail: data.thumbnail,
        thumbnail_public_id: data.thumbnail_public_id, // Save public_id
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
    return { success: false, error: 'Failed to create live' }
  }
}

export async function updateLive(id: string, data: LiveFormData) {
  try {
    // Get the current live to check for the old thumbnail
    const currentLive = await prisma.live.findUnique({ where: { id } });

    // If the thumbnail has changed and there was an old one, delete it from Cloudinary
    if (currentLive?.thumbnail_public_id && currentLive.thumbnail_public_id !== data.thumbnail_public_id) {
      await cloudinary.uploader.destroy(currentLive.thumbnail_public_id).catch(err => 
        console.warn(`Failed to delete old thumbnail ${currentLive.thumbnail_public_id}:`, err)
      );
    }

    const live = await prisma.live.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        videoUrl: data.videoUrl,
        thumbnail: data.thumbnail,
        thumbnail_public_id: data.thumbnail_public_id, // Update public_id
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
    return { success: false, error: 'Failed to update live' }
  }
}

export async function deleteLive(id: string) {
  try {
    // Also delete thumbnail from Cloudinary on delete
    const liveToDelete = await prisma.live.findUnique({ where: { id } });
    if (liveToDelete?.thumbnail_public_id) {
      await cloudinary.uploader.destroy(liveToDelete.thumbnail_public_id).catch(err => 
        console.warn(`Failed to delete thumbnail ${liveToDelete.thumbnail_public_id}:`, err)
      );
    }

    await prisma.live.delete({
      where: { id }
    })

    revalidatePath('/admin/lives')
    revalidatePath('/lives')
    return { success: true }
  } catch (error) {
    console.error('Error deleting live:', error)
    return { success: false, error: 'Failed to delete live' }
  }
}