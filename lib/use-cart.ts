"use client"

import { useCart as useCartContext } from './cart-context';

export const useCart = () => {
  const { state, dispatch } = useCartContext();

  const addToCart = (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    selectedSize: string;
    quantity?: number;
  }) => {
    console.log(item, 'alkdsfjskldjfkl')
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...item,
        quantity: item.quantity || 1,
      },
    });
  };

  const removeFromCart = (id: string, selectedSize: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: `${id}-${selectedSize}`,
    });
  };

  const updateQuantity = (id: string, selectedSize: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        id: `${id}-${selectedSize}`,
        quantity,
      },
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartItemKey = (id: string, selectedSize: string) => {
    return `${id}-${selectedSize}`;
  };

  const isInCart = (id: string, selectedSize: string) => {
    return state.items.some(item => 
      item.id === id && 
      item.selectedSize === selectedSize
    );
  };

  const getItemQuantity = (id: string, selectedSize: string) => {
    const item = state.items.find(item => 
      item.id === id && 
      item.selectedSize === selectedSize
    );
    return item ? item.quantity : 0;
  };

  return {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getCartItemKey,
  };
};