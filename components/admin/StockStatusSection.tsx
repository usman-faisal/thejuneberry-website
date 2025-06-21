interface StockStatusSectionProps {
  inStock: boolean
  isSubmitting: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function StockStatusSection({ inStock, isSubmitting, onChange }: StockStatusSectionProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        name="inStock"
        checked={inStock}
        onChange={onChange}
        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
        disabled={isSubmitting}
      />
      <label className="ml-3 text-sm font-medium text-gray-700">
        Item is in stock
      </label>
    </div>
  )
} 