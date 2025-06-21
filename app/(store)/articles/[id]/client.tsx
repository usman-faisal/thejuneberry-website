'use client'

import { useState } from 'react';
import { useCart } from '@/lib/use-cart';
import { Prisma } from '@prisma/client';
import { toast } from 'sonner';
import {
  ImageGallery,
  ProductHeader,
  SizeSelector,
  SizeChart,
  QuantitySelector,
  ActionButtons,
  DeliveryInfo,
  ProductFeatures,
  VideoModal
} from '@/components/article';

interface ArticleClientProps {
  article: Prisma.ArticleGetPayload<{
    include: { sizes: true };
  }> & {
    images: string[];
    videos: string[];
  }
}

export function ArticleClient({ article }: ArticleClientProps) {
  const [selectedSize, setSelectedSize] = useState(article.sizes.length > 0 ? article.sizes[0].size : '');
  const [quantity, setQuantity] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');

  const { addToCart, isInCart, getItemQuantity } = useCart();

  // Create media items array (images + videos + facebook video if exists)
  const mediaItems = [
    ...article.images.map((image, index) => ({
      type: 'image' as const,
      url: image,
      index: index,
      isCloudinary: true
    })),
    ...article.videos.map((video, index) => ({
      type: 'video' as const,
      url: video,
      index: article.images.length + index,
      isCloudinary: true
    })),
    ...(article.videoUrl ? [{
      type: 'video' as const,
      url: article.videoUrl,
      index: article.images.length + article.videos.length,
      isCloudinary: false // Facebook embed
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
      image: article.images[0],
      selectedSize: selectedSize,
      quantity,
    });

    setQuantity(1);
    toast.success('Added to cart successfully!');
  };

  const handleVideoPlay = (videoUrl: string, isCloudinary: boolean) => {
    setSelectedVideoUrl(videoUrl);
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideoUrl('');
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
          <ProductHeader
            name={article.name}
            price={article.price}
            inStock={article.inStock}
            description={article.description || undefined}
          />

          <div>
            <SizeSelector
              sizes={article.sizes}
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
            />
            <div className="flex items-center justify-between mt-8">
              <SizeChart />
            </div>
          </div>

          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            currentItemQuantity={currentItemQuantity}
            itemInCart={itemInCart}
          />

          <ActionButtons
            inStock={article.inStock}
            selectedSize={selectedSize}
            onAddToCart={handleAddToCart}
          />

          <DeliveryInfo />
          <ProductFeatures />
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        videoUrl={selectedVideoUrl}
        onClose={handleCloseVideoModal}
      />
    </>
  );
}