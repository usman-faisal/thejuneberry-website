import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        live: true,
        images: true,
        sizes: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
) {
  try {
    const { articleId } = await request.json()
    // get article images
    const articleImages = await prisma.image.findMany({
      where: { articleId: articleId }
    })
    // delete images from cloudinary
    const deletePromises = articleImages
      .map(image => {
        cloudinary.uploader.destroy(image.public_id)
      })
    await Promise.all(deletePromises)
    // delete article
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const article = await prisma.article.delete({
      where: { id: articleId },
      include: {
        images: true,
        live: true,
        sizes: true
      }
    })
    return NextResponse.json(article)
  } catch (error) {
    console.log(error)

    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // The full list of images the article *should* have after the update
    const incomingImages: { url: string; public_id?: string }[] = data.images || [];
    const incomingSizes: string[] = data.sizes || [];

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the current state of the article's images from the DB
      const existingImages = await tx.image.findMany({
        where: { articleId: id },
      });
      const existingImagePublicIds = existingImages.map(img => img.public_id);
      const incomingImagePublicIds = incomingImages
        .map(img => img.public_id)
        .filter(pid => pid); // Filter out any null/undefined public_ids

      // 2. Determine which images to add and which to delete
      const imagesToCreate = incomingImages.filter(
        (img) => img.public_id && !existingImagePublicIds.includes(img.public_id)
      );

      const imagesToDelete = existingImages.filter(
        (img) => !incomingImagePublicIds.includes(img.public_id)
      );

      // 3. Delete images from Cloudinary and the database
      if (imagesToDelete.length > 0) {
        // Delete from Cloudinary
        const publicIdsToDelete = imagesToDelete.map(img => img.public_id);
        await cloudinary.api.delete_resources(publicIdsToDelete);

        // Delete from Database
        await tx.image.deleteMany({
          where: {
            public_id: { in: publicIdsToDelete },
          },
        });
      }

      // 4. Handle Sizes: Delete existing and create new ones (your logic is fine)
      await tx.articleSize.deleteMany({
        where: { articleId: id },
      });
      
      // 5. Update the article and create the new images and sizes
      const updatedArticle = await tx.article.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          category: data.category,
          inStock: data.inStock ?? true,
          liveId: data.liveId || null,
          sizes: {
            create: incomingSizes.map((size: string) => ({ size })),
          },
          images: {
            create: imagesToCreate.map(img => ({
              url: img.url,
              public_id: img.public_id!, // The filter above ensures public_id exists
            })),
          },
        },
        include: { sizes: true, images: true },
      });

      return updatedArticle;
  }, {timeout: 10000});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update article:', error);
    // Provide more detailed error response in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update article', details: errorMessage }, { status: 500 });
  }
}