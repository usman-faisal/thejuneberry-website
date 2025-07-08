import Link from 'next/link'
import { Play, ShoppingBag, Sparkles, Heart, Star, Users } from 'lucide-react'
import Image from 'next/image'
import ProductHighlights from '../../components/product-highlights'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TheJuneBerry - Premium Pakistani Dresses & Live Fashion Shows',
  description: 'Experience authentic Pakistani fashion through exclusive live showcases. Shop premium dresses, traditional and modern styles delivered across Pakistan. Join 10K+ fashion enthusiasts.',
  keywords: ['Pakistani dresses online', 'live fashion shows', 'premium clothing Pakistan', 'traditional Pakistani wear', 'modern dresses Pakistan', 'online shopping Pakistan'],
  openGraph: {
    title: 'TheJuneBerry - Premium Pakistani Dresses & Live Fashion Shows',
    description: 'Experience authentic Pakistani fashion through exclusive live showcases. Shop premium dresses delivered across Pakistan.',
    url: 'https://thejuneberry.vercel.app',
    images: [
      {
        url: '/images/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TheJuneBerry Premium Pakistani Fashion Collection',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheJuneBerry - Premium Pakistani Dresses & Live Fashion Shows',
    description: 'Experience authentic Pakistani fashion through exclusive live showcases.',
    images: ['/images/hero-image.jpg'],
  },
  alternates: {
    canonical: 'https://thejuneberry.vercel.app',
  },
}


export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TheJuneBerry",
    "description": "Premium Pakistani fashion and dresses",
    "url": "https://thejuneberry.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://thejuneberry.vercel.app/articles?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TheJuneBerry",
      "logo": "https://thejuneberry.vercel.app/images/favicon.jpg"
    }
  }
  return (
    <>
    <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(structuredData)
    }}
  />

    <div className="min-h-screen">
      {/* Hero Section - Mobile First */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-4 py-8 sm:py-12 lg:py-0">
        {/* Enhanced Mobile Background */}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
          <div className="absolute inset-0 opacity-5 sm:opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <defs>
                <pattern id="floral" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
                  <circle cx="7.5" cy="7.5" r="0.8" fill="currentColor" className="text-pink-300"/>
                  <circle cx="2" cy="2" r="0.4" fill="currentColor" className="text-orange-300"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#floral)"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Mobile-First Content */}
            <div className="text-center lg:text-left space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-pink-100 text-pink-800 rounded-full text-xs sm:text-sm font-medium shadow-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Featured Collection
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  Discover
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500 mt-1">
                    TheJuneBerry
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Experience authentic Pakistani fashion through our exclusive live showcases. 
                  From traditional elegance to modern styles, find your perfect dress.
                </p>
              </div>

              {/* Mobile-Optimized Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-sm mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-pink-600">500+</div>
                  <div className="text-xs sm:text-sm text-gray-500">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-500">100+</div>
                  <div className="text-xs sm:text-sm text-gray-500">Live Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-xs sm:text-sm text-gray-500">Cities Covered</div>
                </div>
              </div>

              {/* Mobile-First CTA Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 max-w-sm mx-auto lg:mx-0">
                <Link 
                  href="/lives"
                  className="group flex items-center justify-center px-6 py-4 sm:px-8 bg-gradient-to-r from-pink-600 to-orange-500 text-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 font-semibold"
                >
                  <Play className="mr-3 group-hover:scale-110 transition-transform" size={18} />
                  Watch Live Shows
                </Link>
                <Link 
                  href="/articles"
                  className="flex items-center justify-center px-6 py-4 sm:px-8 border-2 border-pink-600 text-pink-600 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-pink-50 transition-all duration-300 active:scale-95 font-medium"
                >
                  <ShoppingBag className="mr-3" size={18} />
                  Browse Collection
                </Link>
              </div>
            </div>

            {/* Mobile-Optimized Image Section */}
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto order-1 lg:order-2">
              {/* Floating Elements */}
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 lg:-bottom-8 lg:-left-8 w-16 h-16 sm:w-20 sm:h-20 lg:w-32 lg:h-32 bg-orange-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
              
              {/* Main Image Container - Mobile Optimized */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-3 lg:p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="relative h-80 sm:h-96 lg:h-[600px] w-full rounded-xl sm:rounded-2xl overflow-hidden">
                  <Image
                    src="https://res.cloudinary.com/dmc17z9zc/image/upload/v1750580356/articles/30_77294a00-b03c-4f75-935c-743289fcd13d_oit36v.webp"
                    alt="Beautiful traditional orange dress with floral embroidery"
                    width={1080}
                    height={1920}
                    priority
                    className="object-cover object-center"
                  />
                  {/* Mobile-Friendly Overlay Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-xs sm:text-sm font-medium">Trending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlights Section - Mobile Enhanced */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">Products</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
              Explore a few of our latest arrivals. Find your perfect dress from our exclusive collection!
            </p>
          </div>
          
          {/* Product Grid */}
          <ProductHighlights />
          
          <div className="flex justify-center mt-8 sm:mt-10 px-4">
            <Link 
              href="/articles" 
              className="inline-block px-6 py-4 sm:px-8 bg-gradient-to-r from-pink-600 to-orange-500 text-white rounded-2xl hover:shadow-xl transition-all font-semibold text-base sm:text-lg transform hover:-translate-y-1 active:scale-95"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
              <Users className="text-pink-600 flex-shrink-0" size={28} />
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm sm:text-base text-gray-600">Facebook Followers</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
              <Heart className="text-red-500 flex-shrink-0" size={28} />
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm sm:text-base text-gray-600">Customer Satisfaction</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
              <Star className="text-yellow-500 flex-shrink-0" size={28} />
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-sm sm:text-base text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mobile-First CTA Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-orange-500 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Mobile-optimized content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to Discover Your 
            <span className="block mt-1">Perfect Style?</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 max-w-xl lg:max-w-2xl mx-auto leading-relaxed">
            Join thousands of fashion enthusiasts who trust TheJuneBerry for authentic Pakistani dresses. 
            Experience fashion like never before through our live interactive sessions.
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto sm:flex-row sm:justify-center">
            <Link 
              href="/lives"
              className="flex items-center justify-center px-6 py-4 sm:px-8 bg-white text-pink-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 font-semibold shadow-lg"
            >
              <Play className="mr-3" size={18} />
              Join Live Session
            </Link>
            <Link 
              href="/articles"
              className="flex items-center justify-center px-6 py-4 sm:px-8 border-2 border-white text-white bg-transparent rounded-2xl hover:bg-white hover:text-pink-600 transition-all duration-300 active:scale-95 font-medium"
            >
              <ShoppingBag className="mr-3" size={18} />
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}