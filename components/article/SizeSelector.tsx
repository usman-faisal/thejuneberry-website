interface Size {
  id: string;
  size: string;
}

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSizeSelect }: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Size</h3>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => (
          <button
            key={size.id}
            onClick={() => onSizeSelect(size.size)}
            className={`px-4 py-2.5 border-2 rounded-xl font-medium transition-all duration-200 ${
              selectedSize === size.size
                ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {size.size}
          </button>
        ))}
      </div>
    </div>
  );
} 