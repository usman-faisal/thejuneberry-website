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
            article: true
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
            article: true
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
            article: true
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
  });

  if (!article) {
    return { success: false, error: `Article not found. Please remove it from your found` };
  }

  if (!article.inStock) {
    return { success: false, error: `${article.name} is out of stock. Please remove it from your cart` };
  }

  const sizeExists = article.sizes.some(size => size === selectedSize);
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
            article: true
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


export async function deleteOrder(id: string) {
  try {
    // First delete order items, then the order
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });
    
    await prisma.order.delete({
      where: { id }
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}

export async function cancelOrder(id: string, reason?: string) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { 
        status: OrderStatus.CANCELLED,
        // Add a notes field to your schema if you want to store cancellation reason
        // notes: reason 
      },
      include: {
        items: {
          include: {
            article: true
          }
        }
      }
    });

    revalidatePath('/admin/orders');
    return { success: true, order };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, error: 'Failed to cancel order' };
  }
}

export async function duplicateOrder(id: string) {
  try {
    const originalOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            article: true
          }
        }
      }
    });

    if (!originalOrder) {
      return { success: false, error: 'Order not found' };
    }

    // Validate all items are still available
    for (const item of originalOrder.items) {
      if (!item.article.inStock) {
        return { 
          success: false, 
          error: `${item.article.name} is no longer in stock` 
        };
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName: originalOrder.customerName,
        email: originalOrder.email,
        phone: originalOrder.phone,
        address: originalOrder.address,
        city: originalOrder.city,
        postalCode: originalOrder.postalCode,
        total: originalOrder.total,
        shippingCost: originalOrder.shippingCost,
        status: OrderStatus.PENDING,
        items: {
          create: originalOrder.items.map(item => ({
            articleId: item.articleId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            article: true
          }
        }
      }
    });

    revalidatePath('/admin/orders');
    return { success: true, order: newOrder };
  } catch (error) {
    console.error('Error duplicating order:', error);
    return { success: false, error: 'Failed to duplicate order' };
  }
}

export async function updateOrderItems(orderId: string, items: OrderItem[]) {
  try {
    // Calculate new total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Delete existing items and create new ones
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        total,
        items: {
          create: items.map(item => ({
            articleId: item.articleId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            article: true
          }
        }
      }
    });

    revalidatePath('/admin/orders');
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Error updating order items:', error);
    return { success: false, error: 'Failed to update order items' };
  }
}