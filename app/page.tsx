import Link from 'next/link'
import { Play, ShoppingBag, Sparkles, Heart, Star, Users } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Split Layout */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <defs>
                <pattern id="floral" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" className="text-pink-300"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#floral)"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  ✨ Featured Collection
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Discover
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500">
                    TheJuneBerry
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  Experience authentic Pakistani fashion through our exclusive live showcases. 
                  From traditional elegance to modern styles, find your perfect dress.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">500+</div>
                  <div className="text-sm text-gray-500">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">100+</div>
                  <div className="text-sm text-gray-500">Live Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">50+</div>
                  <div className="text-sm text-gray-500">Cities Covered</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/lives"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-orange-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Play className="mr-3 group-hover:scale-110 transition-transform" size={20} />
                  Watch Live Shows
                </Link>
                <Link 
                  href="/articles"
                  className="inline-flex items-center px-8 py-4 border-2 border-pink-600 text-pink-600 bg-white rounded-2xl hover:bg-pink-50 transition-all duration-300"
                >
                  <ShoppingBag className="mr-3" size={20} />
                  Browse Collection
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
              
              {/* Main Image Container */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="relative h-[600px] w-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/hero-image.jpg"
                    alt="Beautiful traditional orange dress with floral embroidery"
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  {/* Overlay Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="text-sm font-medium">Trending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Design */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-500"> TheJuneBerry?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We bring you the latest Pakistani fashion trends through interactive live sessions, 
              connecting you directly with quality designers and authentic styles.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Play className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Live Fashion Shows</h3>
              <p className="text-gray-600 leading-relaxed">
                Join our exclusive Facebook live sessions where we showcase the latest dress collections with detailed styling tips and real-time interaction.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Authentic Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Handpicked traditional and contemporary dresses featuring genuine embroidery, premium fabrics, and authentic Pakistani craftsmanship.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Nationwide Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Fast, secure, and reliable delivery service covering all major cities across Pakistan with careful packaging and tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center justify-center gap-4">
              <Users className="text-pink-600" size={32} />
              <div>
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Facebook Followers</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Heart className="text-red-500" size={32} />
              <div>
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Star className="text-yellow-500" size={32} />
              <div>
                <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-orange-500 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Discover Your 
            <span className="block">Perfect Style?</span>
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of fashion enthusiasts who trust TheJuneBerry for authentic Pakistani dresses. 
            Experience fashion like never before through our live interactive sessions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/lives"
              className="inline-flex items-center px-8 py-4 bg-white text-pink-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 font-semibold"
            >
              <Play className="mr-3" size={20} />
              Join Live Session
            </Link>
            <Link 
              href="/articles"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white bg-transparent rounded-2xl hover:bg-white hover:text-pink-600 transition-all duration-300"
            >
              <ShoppingBag className="mr-3" size={20} />
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}