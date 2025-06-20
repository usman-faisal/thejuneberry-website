'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/use-cart';
import { Heart, Share2, Plus, Minus, ShoppingBag, Truck, Shield, Clock } from 'lucide-react';
import { Prisma } from '@prisma/client';
import Image from 'next/image';
import { toast } from 'sonner';

interface ArticleClientProps {
  article: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>;
}

export function ArticleClient({ article }: ArticleClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(article.sizes.length > 0 ? article.sizes[0].size : '');
  const [quantity, setQuantity] = useState(1);

  const { addToCart, isInCart, getItemQuantity } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
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

    setQuantity(1);
    toast.success('Added to cart successfully!');
  };

  const currentItemQuantity = getItemQuantity(article.id, selectedSize);
  const itemInCart = isInCart(article.id, selectedSize);

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="aspect-[4/5] relative">
            <Image
              src={article.images[selectedImage].url}
              alt={article.name}
              fill
              className="object-cover"
              priority
            />
            
            {/* Wishlist Button */}
            <button className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors group">
              <Heart className="text-gray-600 group-hover:text-pink-500" size={20} />
            </button>

            {/* Category Badge */}
            {article.category && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 rounded-full">
                  {article.category}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Thumbnail Gallery */}
        {article.images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {article.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  selectedImage === index 
                    ? 'border-pink-500 shadow-md scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${article.name} ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {article.name}
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-3xl font-bold text-gray-900">
              Rs. {article.price.toLocaleString()}
            </p>
            {article.inStock ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                In Stock
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Out of Stock
              </span>
            )}
          </div>
          {article.description && (
            <p className="text-gray-600 leading-relaxed text-lg">
              {article.description}
            </p>
          )}
        </div>

        {/* Size Selection */}
        {article.sizes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Size</h3>
            <div className="flex flex-wrap gap-3">
              {article.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.size)}
                  className={`px-4 py-2.5 border-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedSize === size.size
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-3 hover:bg-gray-50 rounded-l-xl"
              >
                <Minus size={16} />
              </Button>
              <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-50 rounded-r-xl"
              >
                <Plus size={16} />
              </Button>
            </div>
            {itemInCart && (
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                {currentItemQuantity} in cart
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {article.inStock ? (
            <Button 
              onClick={handleAddToCart}
              size="lg" 
              className="w-full bg-gray-900 hover:bg-pink-600 text-white py-4 rounded-xl font-semibold transition-colors"
              disabled={!selectedSize}
            >
              <ShoppingBag className="mr-3" size={20} />
              Add to Cart
            </Button>
          ) : (
            <Button size="lg" className="w-full py-4 rounded-xl" disabled>
              Out of Stock
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="py-3 rounded-xl border-2 hover:bg-gray-50 transition-colors"
            >
              <Heart className="mr-2" size={18} />
              Wishlist
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="py-3 rounded-xl border-2 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="mr-2" size={18} />
              Share
            </Button>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="text-pink-600" size={20} />
            Delivery Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">Delivery costs Rs. 300 within Pakistan</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">International shipping - contact us for rates</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-600">Cash on delivery available</p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
            <Shield className="mx-auto text-green-600 mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900">Quality Assured</p>
            <p className="text-xs text-gray-600">Premium Materials</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
            <Clock className="mx-auto text-blue-600 mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
            <p className="text-xs text-gray-600">2-5 Business Days</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
            <Heart className="mx-auto text-pink-600 mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900">Made with Love</p>
            <p className="text-xs text-gray-600">Handcrafted Quality</p>
          </div>
        </div>
      </div>
    </div>
  );
}