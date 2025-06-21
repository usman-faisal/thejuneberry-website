import { Truck } from 'lucide-react';

export function DeliveryInfo() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="text-pink-600" size={20} />
        Delivery Information
      </h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-gray-600">Delivery costs Rs. 300 within Pakistan</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-gray-600">International shipping - contact us for rates</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-gray-600">Cash on delivery available</p>
        </div>
      </div>
    </div>
  );
} 