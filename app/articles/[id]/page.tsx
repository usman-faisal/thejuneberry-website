"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/lib/use-cart';
import { ArrowLeft, Heart, Share2, Plus } from 'lucide-react';
import { Prisma } from '@prisma/client';
import Image from 'next/image';


export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Prisma.ArticleGetPayload<{
  include: { images: true, sizes: true };
}> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { addToCart, isInCart, getItemQuantity } = useCart();

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`);
      const data = await response.json();
      console.log(data)
      setArticle(data);
      if (data.sizes.length > 0) setSelectedSize(data.sizes[0].size);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!article || !selectedSize) {
      alert('Please select size and color');
      return;
    } 

    addToCart({
      id: article.id,
      name: article.name,
      price: article.price,
      image: article.images[0].url,
      selectedSize: selectedSize,
      quantity,
    });

    // Reset quantity after adding to cart
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <Link href="/articles">
            <Button variant="outline">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentItemQuantity = getItemQuantity(article.id, selectedSize);
  const itemInCart = isInCart(article.id, selectedSize);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/articles">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
              <Image
                src={article.images[selectedImage].url}
                alt={article.name}
                className="w-full h-full object-cover"
                width={400}
                height={400}
                priority
              />
            </div>
            
            {article.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {article.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-pink-600' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${article.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={200}
                      height={200}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <span className="inline-block bg-pink-100 text-pink-800 text-sm px-3 py-1 rounded-full mb-4">
                {article.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.name}</h1>
              <p className="text-3xl font-bold text-pink-600 mb-6">
                Rs. {article.price.toLocaleString()}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">{article.description}</p>
            </div>

            {/* Size Selection */}
            {article.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {article.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.size)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedSize === size.size
                          ? 'border-pink-600 bg-pink-50 text-pink-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}



            {/* Quantity Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
                {itemInCart && (
                  <span className="text-sm text-gray-600 ml-4">
                    ({currentItemQuantity} in cart)
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {article.inStock ? (
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleAddToCart}
                    size="lg" 
                    variant="outline"
                    className="flex-1 border-pink-600 text-pink-600 hover:bg-pink-50"
                    disabled={!selectedSize}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  Out of Stock
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart className="mr-2 h-5 w-5" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Free delivery across Pakistan</li>
                  <li>• Delivery within 3-7 business days</li>
                  <li>• Cash on delivery available</li>
                  <li>• Easy returns within 7 days</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}