import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { cookies } from 'next/headers'

export default async function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Placed Successfully!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your order. We'll contact you soon via WhatsApp to confirm your order and arrange delivery.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/articles"
            className="block w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            Continue Shopping
          </Link>
          
          <Link 
            href="/"
            className="block w-full border border-pink-600 text-pink-600 py-3 px-6 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}