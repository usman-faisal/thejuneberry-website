'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface LiveFormData {
  title: string
  description: string
  date: string
  videoUrl: string
  thumbnail: string
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
        thumbnail: data.thumbnail
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
    const live = await prisma.live.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        videoUrl: data.videoUrl,
        thumbnail: data.thumbnail
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