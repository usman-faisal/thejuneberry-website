import { useState, useRef } from 'react'
import { Upload, X, ImageIcon, Loader2, AlertCircle, Video, Play } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { MediaUpload } from './types'

interface MediaUploadSectionProps {
  type: 'image' | 'video'
  existingMedia: string[]
  mediaUploads: MediaUpload[]
  errors: Record<string, string>
  isSubmitting: boolean
  onMediaUploadsChange: (uploads: MediaUpload[]) => void
  onExistingMediaChange: (media: string[]) => void
  onErrorsChange: (errors: Record<string, string>) => void
}

export function MediaUploadSection({
  type,
  existingMedia,
  mediaUploads,
  errors,
  isSubmitting,
  onMediaUploadsChange,
  onExistingMediaChange,
  onErrorsChange
}: MediaUploadSectionProps) {
  const isImage = type === 'image'

  const handleUploadSuccess = (result: any) => {
    if (result?.info) {
      const newUpload: MediaUpload = {
        id: result.info.public_id,
        file: null as any, // We don't need the file object anymore
        preview: result.info.secure_url,
        uploading: false,
        uploaded: true,
        type,
        url: result.info.secure_url,
        public_id: result.info.public_id
      }

      onMediaUploadsChange([...mediaUploads, newUpload])

      // Clear errors if media is added
      if (errors[`${type}s`]) {
        onErrorsChange({ ...errors, [`${type}s`]: '' })
      }

      toast.success(`${type} uploaded successfully!`)
    }
  }

  const handleUploadError = (error: any) => {
    console.error('Upload error:', error)
    toast.error(`Failed to upload ${type}`)
  }

  const addMediaUrl = () => {
    const url = prompt(`Enter ${type} URL:`)?.trim()
    if (url) {
      try {
        new URL(url)
        onExistingMediaChange([...existingMedia, url])
        if (errors[`${type}s`]) {
          onErrorsChange({ ...errors, [`${type}s`]: '' })
        }
      } catch {
        toast.error('Please enter a valid URL')
      }
    }
  }

  const removeMediaUpload = (id: string) => {
    onMediaUploadsChange(mediaUploads.filter(u => u.id !== id))
  }

  const removeExistingMedia = (index: number) => {
    onExistingMediaChange(existingMedia.filter((_, i) => i !== index))
  }

  const filteredUploads = mediaUploads.filter(u => u.type === type)

  return (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
        {isImage ? <ImageIcon size={16} className="mr-2 text-gray-400" /> : <Video size={16} className="mr-2 text-gray-400" />}
        {type === 'image' ? 'Images' : 'Videos'} {isImage ? '*' : ''}
      </label>

      {/* Upload Actions */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
        <CldUploadWidget
          uploadPreset="ml_default" // You'll need to create this in Cloudinary
          options={{
            multiple: true,
            resourceType: isImage ? 'image' : 'video',
            maxFileSize: isImage ? 10000000 : 100000000, // 10MB for images, 100MB for videos
            sources: ['local', 'url', 'camera'],
            folder: 'articles', // Optional: organize uploads in folders
          }}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        >
          {({ open }: {open: any}) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isSubmitting}
              className={`flex items-center px-3 py-2 md:px-4 md:py-2 text-white rounded-lg hover:opacity-90 cursor-pointer transition-colors disabled:opacity-50 text-sm ${
                isImage ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Upload size={14} className="mr-2" />
              Upload {type === 'image' ? 'Images' : 'Videos'}
            </button>
          )}
        </CldUploadWidget>

        <button
          type="button"
          onClick={addMediaUrl}
          className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          disabled={isSubmitting}
        >
          {isImage ? <ImageIcon size={14} className="mr-2" /> : <Video size={14} className="mr-2" />}
          Add {type === 'image' ? 'Image' : 'Video'} URL
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Existing Media */}
        {existingMedia.map((mediaUrl, index) => (
          <div key={`existing-${type}-${index}`} className="relative group">
            {isImage ? (
              <CldImage
                src={mediaUrl}
                alt={`Product ${index + 1}`}
                className="w-full h-24 md:h-32 object-cover rounded-lg border border-gray-200"
                width={150}
                height={150}
              />
            ) : (
              <>
                <video
                  src={mediaUrl}
                  className="w-full h-24 md:h-32 object-cover rounded-lg border border-gray-200"
                  controls
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-lg pointer-events-none">
                  <Play size={16} className="text-white" />
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => removeExistingMedia(index)}
              className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white rounded-full p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              disabled={isSubmitting}
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Media Upload Preview */}
        {filteredUploads.map((upload) => (
          <div key={upload.id} className="relative group">
            {isImage ? (
              <CldImage
                src={upload.public_id || upload.preview}
                alt="Upload preview"
                className={`w-full h-24 md:h-32 object-cover rounded-lg border ${
                  upload.uploading ? 'opacity-50' : 'border-gray-200'
                }`}
                width={150}
                height={150}
              />
            ) : (
              <>
                <video
                  src={upload.url || upload.preview}
                  className={`w-full h-24 md:h-32 object-cover rounded-lg border ${
                    upload.uploading ? 'opacity-50' : 'border-gray-200'
                  }`}
                  muted
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-lg pointer-events-none">
                  <Play size={16} className="text-white" />
                </div>
              </>
            )}

            {/* Upload States */}
            {upload.uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="flex items-center text-white text-xs">
                  <Loader2 size={12} className="animate-spin mr-1" />
                  Uploading...
                </div>
              </div>
            )}

            {upload.uploaded && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                  ✓ Uploaded
                </div>
              </div>
            )}

            {upload.error && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                  Failed
                </div>
              </div>
            )}

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeMediaUpload(upload.id)}
              className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white rounded-full p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              disabled={upload.uploading || isSubmitting}
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      {errors[`${type}s`] && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle size={16} className="mr-1" />
          {errors[`${type}s`]}
        </p>
      )}
    </div>
  )
}