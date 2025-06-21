'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { Play, Heart, Pause, Volume2, VolumeX } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  index: number;
  isCloudinary: boolean;
}

interface ImageGalleryProps {
  mediaItems: MediaItem[];
  articleName: string;
  category?: string;
  onVideoPlay: (videoUrl: string, isCloudinary: boolean) => void;
}

export function ImageGallery({ mediaItems, articleName, category, onVideoPlay }: ImageGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia = mediaItems[selectedMedia];
  const isVideoSelected = currentMedia?.type === 'video';
  const isCloudinaryVideo = currentMedia?.isCloudinary;

  // Reset video state when switching media
  useEffect(() => {
    setIsPlaying(false);
    setIsMuted(true);
  }, [selectedMedia]);

  const handleVideoPlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreenVideo = () => {
    if (currentMedia) {
      onVideoPlay(currentMedia.url, currentMedia.isCloudinary);
    }
  };

  const handleThumbnailClick = (index: number) => {
    const media = mediaItems[index];
    if (media.type === 'video' && !media.isCloudinary) {
      // For Facebook videos, open modal directly
      onVideoPlay(media.url, media.isCloudinary);
    } else {
      // For images and Cloudinary videos, show in main area
      setSelectedMedia(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="aspect-[4/5] relative">
          {isVideoSelected ? (
            isCloudinaryVideo ? (
              // Cloudinary video - play inline
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="w-full h-full object-cover"
                  muted={isMuted}
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={handleVideoPlayPause}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  {/* Play/Pause Button */}
                  <button
                    onClick={handleVideoPlayPause}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 hover:bg-white transition-colors">
                      {isPlaying ? (
                        <Pause className="text-pink-600 ml-0" size={24} />
                      ) : (
                        <Play className="text-pink-600 ml-1" size={24} fill="currentColor" />
                      )}
                    </div>
                  </button>

                  {/* Bottom Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <button
                      onClick={handleMuteToggle}
                      className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="text-white" size={16} />
                      ) : (
                        <Volume2 className="text-white" size={16} />
                      )}
                    </button>
                    
                    <button
                      onClick={handleFullscreenVideo}
                      className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors text-white text-sm font-medium"
                    >
                      Fullscreen
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Facebook video - show placeholder and open modal
              <div 
                className="w-full h-full bg-gray-900 flex items-center justify-center cursor-pointer relative"
                onClick={() => onVideoPlay(currentMedia.url, currentMedia.isCloudinary)}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-full p-6 hover:bg-white transition-colors">
                  <Play className="text-pink-600 ml-1" size={32} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                  Click to play video
                </div>
              </div>
            )
          ) : (
            // Regular image display
            currentMedia?.isCloudinary ? (
              <CldImage
                src={currentMedia.url}
                alt={articleName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <Image
                src={currentMedia?.url}
                alt={articleName}
                fill
                className="object-cover"
                priority
              />
            )
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
              onClick={() => handleThumbnailClick(index)}
              className={`aspect-square bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                selectedMedia === index 
                  ? 'border-pink-500 shadow-md scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {media.type === 'video' ? (
                // Video thumbnail
                <div className="w-full h-full bg-pink-500 flex items-center justify-center relative">
                  <Play className="text-white" size={20} fill="currentColor" />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {media.isCloudinary ? 'Video' : 'FB'}
                  </div>
                </div>
              ) : (
                // Image thumbnail
                media.isCloudinary ? (
                  <CldImage
                    src={media.url}
                    alt={`${articleName} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={media.url}
                    alt={`${articleName} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                )
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}