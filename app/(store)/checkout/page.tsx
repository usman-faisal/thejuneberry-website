import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { CheckoutForm } from './checkout-form';

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('cart');
  const cartItems = cartCookie ? JSON.parse(cartCookie.value) : [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <Link 
            href="/articles"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </Link>

          {/* Empty Cart State */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag className="text-gray-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Add some beautiful dresses to your cart before proceeding to checkout.
            </p>
            <Link 
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link 
          href="/articles"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order and we'll contact you for confirmation</p>
        </div>

        <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} />
      </div>
    </div>
  );
}