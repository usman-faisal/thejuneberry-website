import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { CheckoutForm } from './checkout-form';

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('cart');
  const cartItems = cartCookie ? JSON.parse(cartCookie.value) : [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/articles">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items to Checkout</h2>
            <p className="text-gray-600 mb-4">Please add items to your cart first.</p>
            <Link href="/articles">
              <Button className="bg-pink-600 hover:bg-pink-700">Go to Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/articles">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} />
      </div>
    </div>
  );
}