'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Heart } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  index: number;
}

interface ImageGalleryProps {
  mediaItems: MediaItem[];
  articleName: string;
  category?: string;
  onVideoPlay: () => void;
}

export function ImageGallery({ mediaItems, articleName, category, onVideoPlay }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const selectedMedia = mediaItems[selectedImage];

  return (
    <div className="space-y-4">
      {/* Main Image/Video Display */}
      <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="aspect-[4/5] relative">
          {selectedMedia?.type === 'video' ? (
            // Video thumbnail with play button
            <div 
              className="w-full h-full bg-gray-900 flex items-center justify-center cursor-pointer relative"
              onClick={onVideoPlay}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-full p-6 hover:bg-white transition-colors">
                <Play className="text-pink-600 ml-1" size={32} fill="currentColor" />
              </div>
              <div className="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                Click to play video
              </div>
            </div>
          ) : (
            // Regular image display
            <Image
              src={selectedMedia?.url}
              alt={articleName}
              fill
              className="object-cover"
              priority
            />
          )}
          
          {/* Wishlist Button */}
          <button className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors group">
            <Heart className="text-gray-600 group-hover:text-pink-500" size={20} />
          </button>

          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 rounded-full">
                {category}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      {mediaItems.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {mediaItems.map((media, index) => (
            <button
              key={index}
              onClick={() => media.type === 'video' ? onVideoPlay() : setSelectedImage(index)}
              className={`aspect-square bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                selectedImage === index 
                  ? 'border-pink-500 shadow-md scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {media.type === 'video' ? (
                // Video thumbnail
                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                  <Play className="text-white" size={20} fill="currentColor" />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    Video
                  </div>
                </div>
              ) : (
                // Image thumbnail
                <Image
                  src={media.url}
                  alt={`${articleName} ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 