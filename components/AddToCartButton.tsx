"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/use-cart';
import { ShoppingCart, Check, Plus } from 'lucide-react';
import { Prisma } from '@prisma/client';

interface AddToCartButtonProps {
  article: Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>;
  selectedSize: Prisma.ArticleSizeGetPayload<{}>;
  quantity?: number;
  showIcon?: boolean;
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  article,
  selectedSize,
  quantity = 1,
  showIcon = true,
  className = ''
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select size and color');
      return;
    }
    addToCart({
      id: article.id,
      name: article.name,
      price: article.price,
      image: article.images[0].url,
      selectedSize: selectedSize.size,
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const itemInCart = isInCart(article.id, selectedSize.size);

  if (!article.inStock) {
    return (
      <Button disabled className={className}>
        Out of Stock
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={!selectedSize || isAdded}
      className={className}
      variant={itemInCart ? "outline" : "default"}
    >
      {showIcon && (
        <>
          {isAdded ? (
            <Check className="mr-2 h-4 w-4" />
          ) : itemInCart ? (
            <Plus className="mr-2 h-4 w-4" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" />
          )}
        </>
      )}
      {isAdded ? 'Added!' : itemInCart ? 'Add More' : 'Add to Cart'}
    </Button>
  );
};

export default AddToCartButton;