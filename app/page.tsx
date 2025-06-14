import Link from 'next/link'
import { Play, ShoppingBag, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-pink-600">TheJuneBerry</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover beautiful dresses through our live showcases. 
              Fashion delivered across Pakistan with style and elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/lives"
                className="inline-flex items-center px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Play className="mr-2" size={20} />
                Watch Our Lives
              </Link>
              <Link 
                href="/articles"
                className="inline-flex items-center px-8 py-3 border border-pink-600 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <ShoppingBag className="mr-2" size={20} />
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TheJuneBerry?
            </h2>
            <p className="text-xl text-gray-600">
              We bring you the latest fashion trends through interactive live sessions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="text-pink-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Showcases</h3>
              <p className="text-gray-600">
                Watch our live Facebook sessions showcasing the latest dress collections
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-pink-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Fashion</h3>
              <p className="text-gray-600">
                Carefully curated dresses for every occasion and style preference
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-pink-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pakistan-wide Delivery</h3>
              <p className="text-gray-600">
                Fast and reliable delivery service across all major cities in Pakistan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Dress?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join our live sessions or browse our collection to discover your next favorite outfit
          </p>
          <Link 
            href="/lives"
            className="inline-flex items-center px-8 py-3 bg-white text-pink-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}