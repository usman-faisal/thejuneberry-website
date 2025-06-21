import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';

interface ActionButtonsProps {
  inStock: boolean;
  selectedSize: string;
  onAddToCart: () => void;
}

export function ActionButtons({ inStock, selectedSize, onAddToCart }: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      {inStock ? (
        <Button 
          onClick={onAddToCart}
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
  );
} 