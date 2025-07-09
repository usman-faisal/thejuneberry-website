import Link from 'next/link'
import { CheckCircle, CreditCard, Smartphone, MessageCircle, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed - Thank You!',
  description: 'Your order has been successfully placed. We will contact you soon to confirm your purchase and arrange delivery.',
  robots: {
    index: false, // Don't index success pages
    follow: false,
  },
  openGraph: {
    title: 'Order Confirmed - TheJuneBerry',
    description: 'Your order has been successfully placed',
    url: 'https://thejuneberry.vercel.app/checkout/success',
  },
}

export default async function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-lg">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Order Placed Successfully!
            </h1>
            
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Thank you for your order! We'll contact you soon via WhatsApp to confirm and arrange delivery.
            </p>
          </div>

          {/* Tax Warning - More Prominent */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div>
                <p className="text-red-800 font-semibold text-sm mb-1">Government COD Tax Alert</p>
                <p className="text-red-700 text-xs leading-relaxed">
                  A <span className="font-bold">4% tax</span> applies to all Cash on Delivery orders due to new regulations.
                </p>
                <p className="text-green-700 font-semibold text-xs mt-1">
                  💰 Pay online now to save 4% and avoid this tax!
                </p>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pay Online & Save 4%
              </h2>
              <p className="text-pink-100 text-sm">Choose your preferred payment method</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Bank Transfer */}
              <div className="group hover:bg-gray-50 transition-colors rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">Bank Transfer</span>
                      <p className="text-xs text-gray-500">Instant & Secure</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Recommended</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Account Number</span>
                    <span className="font-mono font-bold text-sm text-gray-900">0523227868179</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Account Title</span>
                    <span className="font-medium text-sm text-gray-900">Syeda Sonia Faisal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Bank</span>
                    <span className="font-medium text-sm text-gray-900">UBL</span>
                  </div>
                </div>
              </div>

              {/* Mobile Wallets */}
              <div className="group hover:bg-gray-50 transition-colors rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">Mobile Wallets</span>
                      <p className="text-xs text-gray-500">JazzCash • EasyPaisa</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Fast</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Mobile Number</span>
                    <span className="font-mono font-bold text-sm text-gray-900">0300 3570065</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Account Title</span>
                    <span className="font-medium text-sm text-gray-900">Muhammad Faisal Shamsi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-green-800 font-medium text-sm mb-1">Next Step</p>
                <p className="text-green-700 text-xs leading-relaxed">
                  After making payment, send us a screenshot on WhatsApp. We'll confirm your order and provide tracking details!
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* WhatsApp Button - Primary */}
            <a
              href="https://wa.me/923313365411"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5">
                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.05C13.41 27.634 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.18 0-2.336-.207-3.428-.615l-.245-.09-4.65 1.217 1.24-4.527-.16-.234C7.23 18.13 6.5 16.6 6.5 15c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5-4.262 9.5-9.5 9.5zm5.13-7.13c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 5.02 4.22.7.24 1.25.38 1.68.48.71.15 1.36.13 1.87.08.57-.06 1.75-.72 2-1.41.25-.69.25-1.28.18-1.41-.07-.13-.25-.2-.53-.34z"/>
              </svg>
              Send Payment Screenshot
              <ArrowRight className="w-4 h-4" />
            </a>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/articles"
                className="text-center bg-white border-2 border-pink-200 text-pink-600 py-3 px-4 rounded-xl font-semibold hover:bg-pink-50 transition-colors text-sm"
              >
                Continue Shopping
              </Link>
              
              <Link 
                href="/"
                className="text-center bg-white border-2 border-gray-200 text-gray-600 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Need help? We're here to assist you every step of the way!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}