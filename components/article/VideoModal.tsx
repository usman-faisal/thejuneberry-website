'use client'

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  onClose: () => void;
}

export function VideoModal({ isOpen, videoUrl, onClose }: VideoModalProps) {
  const videoModalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const enterFullscreen = async (element: Element) => {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      }
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      }
    } catch (error) {
      console.warn('Exit fullscreen failed:', error);
    }
  };

  const handleCloseModal = async () => {
    // Exit fullscreen first if in fullscreen mode
    if (document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).msFullscreenElement || 
        (document as any).mozFullScreenElement) {
      await exitFullscreen();
    }
    onClose();
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      // If user exits fullscreen manually, close the modal
      if (!document.fullscreenElement && 
          !(document as any).webkitFullscreenElement && 
          !(document as any).msFullscreenElement && 
          !(document as any).mozFullScreenElement && 
          isOpen) {
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Enter fullscreen when modal opens
  useEffect(() => {
    if (isOpen && videoModalRef.current) {
      setTimeout(async () => {
        if (videoModalRef.current) {
          await enterFullscreen(videoModalRef.current);
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      ref={videoModalRef}
      className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50 p-4"
    >
      <div className="relative w-full h-full max-w-none max-h-none">
        {/* Close Button - positioned for fullscreen */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/20 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>
        
        {/* Video Embed - fullscreen optimized */}
        <div className="w-full h-full">
          <iframe
            ref={iframeRef}
            src={`${videoUrl}&autoplay=1`}
            width="100%"
            height="100%" 
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
} 