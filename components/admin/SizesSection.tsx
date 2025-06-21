import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Size } from '@prisma/client'

interface SizesSectionProps {
  sizes: Size[]
  isSubmitting: boolean
  onSizesChange: (sizes: Size[]) => void
}

// All available sizes from the enum
const AVAILABLE_SIZES: Size[] = [
  Size.XS,
  Size.S,
  Size.M,
  Size.L,
  Size.XL,
  Size.XXL,
  Size.XXXL
]

export function SizesSection({ sizes, isSubmitting, onSizesChange }: SizesSectionProps) {
  const [selectedSize, setSelectedSize] = useState<Size | "">("")

  const addSize = (size: Size) => {
    if (!sizes.includes(size)) {
      onSizesChange([...sizes, size])
      setSelectedSize("")
    } else {
      toast.error('Size already exists')
    }
  }

  const removeSize = (sizeToRemove: Size) => {
    onSizesChange(sizes.filter(size => size !== sizeToRemove))
  }

  // Filter out already selected sizes
  const availableSizes = AVAILABLE_SIZES.filter(size => !sizes.includes(size))

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Available Sizes
      </label>
      
      {availableSizes.length > 0 && (
        <div className="flex gap-2 mb-3">
          <Select
            value={selectedSize}
            onValueChange={(value: Size) => {
              setSelectedSize(value)
              addSize(value)
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a size to add" />
            </SelectTrigger>
            <SelectContent>
              {availableSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                disabled={isSubmitting}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {availableSizes.length === 0 && (
        <p className="text-sm text-gray-500">All available sizes have been added.</p>
      )}
    </div>
  )
}