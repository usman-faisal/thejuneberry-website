export interface MediaUpload {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  public_id?: string
  error?: string
  type: 'image' | 'video'
} 