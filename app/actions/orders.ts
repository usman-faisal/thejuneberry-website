'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { OrderStatus } from '@prisma/client';

interface OrderItem {
  articleId: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
  items: OrderItem[];
  total: number;
  shippingCost: number;
  status: OrderStatus;
}

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            article: {
              include: {
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return { success: true, orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

export async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            article: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, order };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error: 'Failed to fetch order' };
  }
}

export async function updateOrderStatus(id: string, status: OrderFormData['status']) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            article: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    revalidatePath('/admin/orders');
    return { success: true, order };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}

export async function validateOrderItem(articleId: string, selectedSize: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      sizes: true
    }
  });

  if (!article) {
    return { success: false, error: `Article not found. Please remove it from your found` };
  }

  if (!article.inStock) {
    return { success: false, error: `${article.name} is out of stock. Please remove it from your cart` };
  }

  const sizeExists = article.sizes.some(size => size.size === selectedSize);
  if (!sizeExists) {
    return { success: false, error: `Selected size is not available for ${article.name}. Please remove it from your cart` };
  }

  return { success: true, article};
}

export async function createOrder(data: OrderFormData) {
  try {
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        total: data.total,
        shippingCost: data.shippingCost,
        status: data.status,
        items: {
          create: data.items.map(item => ({
            articleId: item.articleId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            article: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    // Clear the cart cookie after successful order
    const cookieStore = await cookies();
    cookieStore.set('cart', '', { expires: new Date(0) });

    revalidatePath('/admin/orders');
    return { success: true, order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
} 