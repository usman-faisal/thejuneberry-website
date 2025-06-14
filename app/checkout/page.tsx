"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/lib/use-cart';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Pakistan'
  });

  const { items: cartItems, totalPrice: cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemsToOrder = cartItems.map(item => ({
      articleId: item.id,
      articleName: item.name,
      price: item.price,
      selectedSize: item.selectedSize,
      image: item.image,
      quantity: item.quantity
    }));

    if (itemsToOrder.length === 0) return;

    setLoading(true);

    try {
      const orderPromises = itemsToOrder.map(item => {
        const orderData = {
          ...formData,
          // only add email if it's provided
          article: item.articleId,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          totalAmount: item.price * item.quantity,
          items: itemsToOrder,
          ...(formData.email.length > 0 ? { email: formData.email } : {}),
        };

        return fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
      });

      const responses = await Promise.all(orderPromises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {

        // Clear checkout data
        localStorage.removeItem('checkoutData');
        localStorage.removeItem('checkoutCartData');

        clearCart();

        window.location.href = '/checkout/success';
      } else {
        alert('Error placing some orders. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const itemsToDisplay = cartItems;
  const totalAmount = cartTotal;

  if (itemsToDisplay.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items to Checkout</h2>
          <p className="text-gray-600 mb-4">Please add items to your cart first.</p>
          <Link href="/articles">
            <Button className="bg-pink-600 hover:bg-pink-700">Go to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/articles">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary ({itemsToDisplay.length} item{itemsToDisplay.length > 1 ? 's' : ''})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemsToDisplay.map((item, index) => {
                const itemKey = `${item.id}-${item.selectedSize}`;
                return (
                  <div key={itemKey} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        className="w-full h-full object-cover"
                        alt={item.name}
                        width={150}
                        height={150}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.selectedSize}
                      </p>
                      <p className="text-lg font-semibold text-pink-600">
                        Rs. {item.price.toLocaleString()}
                      </p>

                      {/* Quantity Controls for Cart Checkout */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>


                    </div>
                  </div>
                );
              })}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Delivery:</span>
                  {formData.country === 'Pakistan' ? (
                    <span className="text-green-600">300 PKR</span>
                  ) : (
                    <span className="text-gray-600">Contact us for delivery fee</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-pink-600">
                    Rs. {formData.country === 'Pakistan' ? (totalAmount + 300).toLocaleString() : totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complete Address *
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House/Flat #, Street, Area"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <Input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="Pakistan">Pakistan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <Input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="54000"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : `Place Order - Rs. ${totalAmount.toLocaleString()}`}
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  * Cash on Delivery available. We'll contact you to confirm your order.
                </p>

                <p className="text-sm text-gray-600 text-center">
                  * 
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}