'use client'

import { useState } from 'react';
import { useCart } from '@/lib/use-cart';
import { Prisma } from '@prisma/client';
import { toast } from 'sonner';
import {
  ImageGallery,
  ProductHeader,
  SizeSelector,
  SizeChart, // Add this import
  QuantitySelector,
  ActionButtons,
  DeliveryInfo,
  ProductFeatures,
  VideoModal
} from '@/components/article';

interface ArticleClientProps {
  article: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>
}

export function ArticleClient({ article }: ArticleClientProps) {
  const [selectedSize, setSelectedSize] = useState(article.sizes.length > 0 ? article.sizes[0].size : '');
  const [quantity, setQuantity] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const { addToCart, isInCart, getItemQuantity } = useCart();

  // Create media items array (images + video if exists)
  const mediaItems = [
    ...article.images.map((image, index) => ({
      type: 'image' as const,
      url: image.url,
      index: index
    })),
    ...(article.videoUrl ? [{
      type: 'video' as const,
      url: article.videoUrl,
      index: article.images.length
    }] : [])
  ];

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

  const handleVideoPlay = () => {
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
  };

  const currentItemQuantity = getItemQuantity(article.id, selectedSize);
  const itemInCart = isInCart(article.id, selectedSize);
  
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <ImageGallery
          mediaItems={mediaItems}
          articleName={article.name}
          category={article.category || undefined}
          onVideoPlay={handleVideoPlay}
        />

        {/* Product Details */}
        <div className="space-y-8">
          {/* Header */}
          <ProductHeader
            name={article.name}
            price={article.price}
            inStock={article.inStock}
            description={article.description || undefined}
          />

          {/* Size Selection with Size Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">Size</span>
              <SizeChart />
            </div>
            <SizeSelector
              sizes={article.sizes}
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
            />
          </div>

          {/* Quantity Selection */}
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            currentItemQuantity={currentItemQuantity}
            itemInCart={itemInCart}
          />

          {/* Action Buttons */}
          <ActionButtons
            inStock={article.inStock}
            selectedSize={selectedSize}
            onAddToCart={handleAddToCart}
          />

          {/* Delivery Information */}
          <DeliveryInfo />

          {/* Additional Features */}
          <ProductFeatures />
        </div>
      </div>

      {/* Video Modal */}
      {article.videoUrl && (
        <VideoModal
          isOpen={showVideoModal}
          videoUrl={article.videoUrl}
          onClose={handleCloseVideoModal}
        />
      )}
    </>
  );
}