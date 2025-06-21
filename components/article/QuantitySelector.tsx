import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  currentItemQuantity?: number;
  itemInCart?: boolean;
}

export function QuantitySelector({ 
  quantity, 
  onQuantityChange, 
  currentItemQuantity, 
  itemInCart 
}: QuantitySelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="p-3 hover:bg-gray-50 rounded-l-xl"
          >
            <Minus size={16} />
          </Button>
          <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuantityChange(quantity + 1)}
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
  );
} 