'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Truck, Shield, Phone } from 'lucide-react';
import Image from 'next/image';
import { createOrder, validateOrderItem } from '@/app/actions/orders';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-context';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  selectedSize: string;
  quantity: number;
}

interface CheckoutFormProps {
  cartItems: CartItem[];
  totalAmount: number;
}

export function CheckoutForm({ cartItems, totalAmount }: CheckoutFormProps) {
  const router = useRouter();
  const {dispatch} = useCart()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationPromises = cartItems.map(item => 
        validateOrderItem(item.id, item.selectedSize)
      );
      
      const validationResults = await Promise.all(validationPromises);
      const validationErrors = validationResults
        .filter((result): result is { success: false; error: string } => !result.success)
        .map(result => result.error);

      if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
          toast.error(error)
        });
        return;
      }

      const orderData = {
        ...formData,
        items: cartItems.map(cartItem => ({
          articleId: cartItem.id,
          quantity: cartItem.quantity,
          price: cartItem.price
        })),
        total: totalAmount,
        shippingCost: formData.country === 'Pakistan' ? 300 : 0,
        status: 'PENDING' as const
      };

      const result = await createOrder(orderData);

      if (result.success) {
        toast.success('Order placed successfully!');
        dispatch({type: 'CLEAR_CART'})
        router.push('/checkout/success');
      } else {
        toast.error(result.error || 'Error placing order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deliveryCost = formData.country === 'Pakistan' ? 300 : 0;
  const finalTotal = totalAmount + deliveryCost;

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Order Summary - Takes 2 columns */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-8">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Package className="text-pink-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                <p className="text-sm text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {cartItems.map((item) => {
              const itemKey = `${item.id}-${item.selectedSize}`;
              return (
                <div key={itemKey} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt={item.name}
                      width={64}
                      height={64}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white text-xs text-gray-700 rounded">
                        {item.selectedSize}
                      </span>
                      <span className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="p-6 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rs. {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Delivery</span>
              {formData.country === 'Pakistan' ? (
                <span className="font-medium text-green-600">Rs. 300</span>
              ) : (
                <span className="text-xs text-gray-500">Contact for rates</span>
              )}
            </div>
            <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-100">
              <span>Total</span>
              <span className="text-gray-900">
                Rs. {finalTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information Form - Takes 3 columns */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Truck className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delivery Details</h2>
              <p className="text-sm text-gray-600">We'll contact you to confirm your order</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="rounded-lg border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="rounded-lg border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-lg border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Delivery Address</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="rounded-lg border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                  placeholder="House/Flat #, Street, Area"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="rounded-lg border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    placeholder="Lahore"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province *
                  </label>
                  <Input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="rounded-lg border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    placeholder="Punjab"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-pink-500 focus:ring-pink-500 focus:outline-none"
                    required
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="rounded-lg border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    placeholder="54000"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gray-900 hover:bg-pink-600 text-white py-4 rounded-lg font-semibold transition-colors"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Place Order - Rs. ${finalTotal.toLocaleString()}`}
              </Button>
            </div>
          </form>

          {/* Payment Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <Phone className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-green-900">Cash on Delivery</p>
                <p className="text-xs text-green-700">Pay when you receive</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <Shield className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900">Secure Order</p>
                <p className="text-xs text-blue-700">Your data is protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
              <Truck className="text-orange-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-orange-900">Fast Delivery</p>
                <p className="text-xs text-orange-700">2-5 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}