interface ProductHeaderProps {
  name: string;
  price: number;
  inStock: boolean;
  description?: string;
}

export function ProductHeader({ name, price, inStock, description }: ProductHeaderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
        {name}
      </h1>
      <div className="flex items-center gap-4">
        <p className="text-3xl font-bold text-gray-900">
          Rs. {price.toLocaleString()}
        </p>
        {inStock ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            In Stock
          </span>
        ) : (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
            Out of Stock
          </span>
        )}
      </div>
      {description && (
        <p className="text-gray-600 leading-relaxed text-lg">
          {description}
        </p>
      )}
    </div>
  );
} 