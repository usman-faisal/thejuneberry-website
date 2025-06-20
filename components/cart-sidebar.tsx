"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/use-cart';
import { X, ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    onClose();
    window.location.href = '/checkout';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sidebar */}
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <ShoppingCart className="text-pink-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                <p className="text-sm text-gray-600">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingBag className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Discover our beautiful collection of dresses and add your favorites to get started.
                </p>
                <Button 
                  onClick={onClose} 
                  className="bg-gray-900 hover:bg-pink-600 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => {
                  const itemKey = `${item.id}-${item.selectedSize}`;
                  return (
                    <div key={itemKey} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">Size:</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-700 rounded">
                              {item.selectedSize}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            Rs. {item.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center bg-gray-50 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        
                        <div className="text-sm font-semibold text-gray-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Total and Actions */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-6 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-gray-900 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1 border-2 hover:bg-gray-50 py-2.5 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    className="px-4 border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 py-2.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Delivery Note */}
              <div className="text-center pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  Free delivery on orders above Rs. 5,000
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;