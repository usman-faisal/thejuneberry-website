import { useState } from 'react'
import { Upload, X, Loader2, AlertCircle, Play, FileImage } from 'lucide-react'
import { toast } from 'sonner'
import { CldUploadWidget, CldImage } from 'next-cloudinary'
import { MediaUpload } from './types'

interface MediaUploadSectionProps {
  existingMedia: string[]
  mediaUploads: MediaUpload[]
  errors: Record<string, string>
  isSubmitting: boolean
  // CHANGE 1: Update the type to allow for a functional update.
  onMediaUploadsChange: (
    updater:
      | MediaUpload[]
      | ((prevUploads: MediaUpload[]) => MediaUpload[])
  ) => void
  onExistingMediaChange: (media: string[]) => void
  onErrorsChange: (errors: Record<string, string>) => void
}

export function MediaUploadSection({
  existingMedia,
  mediaUploads,
  errors,
  isSubmitting,
  onMediaUploadsChange,
  onExistingMediaChange,
  onErrorsChange
}: MediaUploadSectionProps) {
  const [uploadingCount, setUploadingCount] = useState(0)

  // Handle successful uploads - handles each file individually
  const handleUploadSuccess = (result: any) => {
    if (result?.event === 'success' && result?.info) {
      const isVideo = result.info.resource_type === 'video'
      const newUpload: MediaUpload = {
        id: result.info.public_id,
        file: null as any,
        preview: result.info.secure_url,
        uploading: false,
        uploaded: true,
        type: isVideo ? 'video' : 'image',
        url: result.info.secure_url,
        public_id: result.info.public_id
      }

      // CHANGE 2: Use the functional update form to avoid stale state.
      // This ensures that we are always adding to the most recent version of the array.
      onMediaUploadsChange((prevUploads) => [...prevUploads, newUpload])

      // Clear errors if media is added
      if (errors.media) {
        onErrorsChange({ ...errors, media: '' })
      }

      // Decrease uploading count
      setUploadingCount((prev) => Math.max(0, prev - 1))

      toast.success(`${isVideo ? 'Video' : 'Image'} uploaded successfully!`)
    }
  }

  // Handle upload start
  const handleUploadStart = (result: any) => {
    if (result?.event === 'upload-added') {
      setUploadingCount((prev) => prev + 1)
    }
  }

  // Handle upload queue completion
  const handleQueueEnd = (result: any, { widget }: any) => {
    console.log('Upload queue completed')
    setUploadingCount(0)
    // Widget stays open for more uploads
  }

  const handleUploadError = (error: any) => {
    console.error('Upload error:', error)
    setUploadingCount((prev) => Math.max(0, prev - 1))
    toast.error('Failed to upload media')
  }

  const addMediaUrl = () => {
    const url = prompt('Enter image or video URL:')?.trim()
    if (url) {
      try {
        new URL(url)
        onExistingMediaChange([...existingMedia, url])
        if (errors.media) {
          onErrorsChange({ ...errors, media: '' })
        }
      } catch {
        toast.error('Please enter a valid URL')
      }
    }
  }

  const removeMediaUpload = (id: string) => {
    onMediaUploadsChange(mediaUploads.filter((u) => u.id !== id))
  }

  const removeExistingMedia = (index: number) => {
    onExistingMediaChange(existingMedia.filter((_, i) => i !== index))
  }

  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
    const lowerUrl = url.toLowerCase()
    return (
      videoExtensions.some((ext) => lowerUrl.endsWith(ext)) ||
      lowerUrl.includes('res.cloudinary.com') && lowerUrl.includes('/video/')
    )
  }

  const renderMediaPreview = (
    mediaUrl: string,
    isUpload: boolean = false,
    upload?: MediaUpload
  ) => {
    // Prioritize the type from the upload object if available
    const isVideo = isUpload && upload ? upload.type === 'video' : isVideoUrl(mediaUrl)

    if (isVideo) {
      return (
        <>
          <video
            key={mediaUrl} // Add key for better reconciliation
            src={mediaUrl}
            className={`w-full h-24 md:h-32 object-cover rounded-lg border ${
              upload?.uploading ? 'opacity-50' : 'border-gray-200'
            }`}
            muted
            playsInline // Good for mobile
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-lg pointer-events-none">
            <Play size={16} className="text-white" />
          </div>
        </>
      )
    } else {
      // Use CldImage for new uploads and regular Image for existing URLs
      // CldImage works best with a public_id
      const srcForCld = isUpload ? upload?.public_id || mediaUrl : mediaUrl;
      return (
        <CldImage
          src={srcForCld}
          alt="Media preview"
          className={`w-full h-24 md:h-32 object-cover rounded-lg border ${
            upload?.uploading ? 'opacity-50' : 'border-gray-200'
          }`}
          width={150}
          height={150}
          crop="fill"
          gravity="auto"
        />
      )
    }
  }

  return (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
        <FileImage size={16} className="mr-2 text-gray-400" />
        Media (Images & Videos) *
      </label>

      {/* Upload Actions */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
        <CldUploadWidget
          uploadPreset="ml_default" // Make sure this is your correct preset name
          options={{
            multiple: true,
            maxFiles: 10,
            resourceType: 'auto',
            maxFileSize: 100000000, // 100MB
            sources: ['local', 'url', 'camera'],
            folder: 'articles',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'],
            showPoweredBy: false,
            cropping: false,
          }}
          onSuccess={handleUploadSuccess}
          onQueuesEnd={handleQueueEnd}
          onError={handleUploadError}
          onUploadAdded={handleUploadStart} // Use onUploadAdded for more reliable start count
        >
          {({ open, isLoading }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isSubmitting || isLoading || uploadingCount > 0}
              className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {uploadingCount > 0 ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Uploading {uploadingCount}...
                </>
              ) : (
                <>
                  <Upload size={14} className="mr-2" />
                  Upload Media
                </>
              )}
            </button>
          )}
        </CldUploadWidget>

        <button
          type="button"
          onClick={addMediaUrl}
          className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          disabled={isSubmitting}
        >
          <FileImage size={14} className="mr-2" />
          Add Media URL
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Existing Media */}
        {existingMedia.map((mediaUrl, index) => (
          <div key={`existing-media-${index}`} className="relative group">
            {renderMediaPreview(mediaUrl)}
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
        {mediaUploads.map((upload) => (
          <div key={upload.id} className="relative group">
            {/* Pass the full preview URL to renderMediaPreview for newly uploaded items */}
            {renderMediaPreview(upload.preview, true, upload)}

            {upload.uploaded && (
              <button
                type="button"
                onClick={() => removeMediaUpload(upload.id)}
                className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white rounded-full p-1 md:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                disabled={isSubmitting}
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
      </div>

      {errors.media && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle size={16} className="mr-1" />
          {errors.media}
        </p>
      )}
    </div>
  )
}