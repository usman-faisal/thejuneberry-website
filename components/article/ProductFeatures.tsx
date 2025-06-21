import { Shield, Clock, Heart } from 'lucide-react';

export function ProductFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
        <Shield className="mx-auto text-green-600 mb-2" size={24} />
        <p className="text-sm font-medium text-gray-900">Quality Assured</p>
        <p className="text-xs text-gray-600">Premium Materials</p>
      </div>
      <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
        <Clock className="mx-auto text-blue-600 mb-2" size={24} />
        <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
        <p className="text-xs text-gray-600">2-5 Business Days</p>
      </div>
      <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
        <Heart className="mx-auto text-pink-600 mb-2" size={24} />
        <p className="text-sm font-medium text-gray-900">Made with Love</p>
        <p className="text-xs text-gray-600">Handcrafted Quality</p>
      </div>
    </div>
  );
} 