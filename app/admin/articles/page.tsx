'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, ShoppingBag, Upload, X, ImageIcon } from 'lucide-react'
import { Prisma } from '@prisma/client'
import Image from 'next/image'

interface ImageUpload {
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  public_id?: string
  error?: string
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }>[]>([])
  const [lives, setLives] = useState<Prisma.LiveGetPayload<{
    include: { articles: true };
  }>[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Prisma.ArticleGetPayload<{
    include: { images: true, sizes: true };
  }> | null>(null)
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [] as { url: string; public_id?: string }[],
    category: '',
    sizes: [] as string[], // Changed from single size to array of sizes
    inStock: true,
    liveId: ''
  })

  // State for managing size input
  const [newSize, setNewSize] = useState('')

  useEffect(() => {
    fetchArticles()
    fetchLives()
  }, [])

  useEffect(() => {
    if (editingArticle) {
      // When editing, populate formData with existing data
      setFormData({
        name: editingArticle.name,
        description: editingArticle.description || '',
        price: editingArticle.price.toString(),
        images: editingArticle.images || [], // Now expects array of image objects
        category: editingArticle.category || '',
        sizes: editingArticle.sizes.map(sizeObj => sizeObj.size) || [], // Extract size strings from ArticleSize objects
        inStock: editingArticle.inStock,
        liveId: editingArticle.liveId || ''
      })
      // Clear any pending uploads from a previous session
      setImageUploads([])
      setShowForm(true)
    }
  }, [editingArticle])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      setArticles(data)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLives = async () => {
    try {
      const response = await fetch('/api/lives')
      const data = await response.json()
      setLives(data)
    } catch (error) {
      console.error('Error fetching lives:', error)
    }
  }

  const uploadToCloudinary = async (file: File): Promise<{ url: string, public_id: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload image')
    }

    const data = await response.json()
    return { url: data.url, public_id: data.public_id }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newUploads: ImageUpload[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }))

    setImageUploads(prev => [...prev, ...newUploads])
  }

  const uploadImages = async (): Promise<{ url: string, public_id: string }[]> => {
    const pendingUploads = imageUploads.filter(upload => !upload.uploaded && !upload.uploading);
    if (pendingUploads.length === 0) {
      return [];
    }

    setUploadingImages(true);

    // Mark all pending uploads as 'uploading'
    setImageUploads(prev => prev.map(u =>
      pendingUploads.includes(u) ? { ...u, uploading: true } : u
    ));

    const uploadPromises = pendingUploads.map(async (upload) => {
      try {
        const { url, public_id } = await uploadToCloudinary(upload.file);
        setImageUploads(prev => prev.map(u =>
          u.preview === upload.preview ? { ...u, uploading: false, uploaded: true, url, public_id } : u
        ));
        return { status: 'fulfilled', value: url, public_id, preview: upload.preview };
      } catch (error) {
        console.error('Error uploading image:', error);
        setImageUploads(prev => prev.map(u =>
          u.preview === upload.preview ? { ...u, uploading: false, error: 'Upload failed' } : u
        ));
        return { status: 'rejected', reason: error, preview: upload.preview };
      }
    });

    const results = await Promise.all(uploadPromises);

    const successfulUploads = results
      .filter(result => result.status === 'fulfilled')
      .map(result => ({ url: result.value, public_id: result.public_id }));

    const hasFailures = results.some(result => result.status === 'rejected');
    if (hasFailures) {
      alert('Some images failed to upload. Please review and try again.');
      setUploadingImages(false);
      throw new Error('Image upload failed');
    }

    return successfulUploads as { url: string, public_id: string }[];
  }

  const removeImageUpload = (index: number) => {
    const upload = imageUploads[index]
    URL.revokeObjectURL(upload.preview)
    setImageUploads(prev => prev.filter((_, i) => i !== index))
  }

  const removeUploadedImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addImageUrl = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: url.trim() }]
      }))
    }
  }

  // Size management functions
  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }))
      setNewSize('')
    }
  }

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const hasPendingUploads = imageUploads.some(upload => !upload.uploaded && !upload.uploading);
  
      if (hasPendingUploads) {
        setUploadingImages(true);
      }
  
      // Upload any pending images and get their URLs
      const newImageUrls = await uploadImages();
  
      // Combine existing images with new uploads
      const allImages = [
        ...formData.images,
        ...newImageUrls.map(img => ({ url: img.url, public_id: img.public_id }))
      ];
  
      // Create a clean payload with only the necessary fields
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        images: allImages,
        category: formData.category,
        sizes: formData.sizes, // This will be an array of strings
        inStock: formData.inStock,
        liveId: formData.liveId || null,
      };
  
      const url = editingArticle ? `/api/articles/${editingArticle.id}` : '/api/articles';
      const method = editingArticle ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (response.ok) {
        fetchArticles();
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('Error saving article:', errorData);
        alert('Failed to save article: ' + (errorData.error || errorData.details || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error in submission process:', error);
      alert('An error occurred while saving the article');
    } finally {
      setUploadingImages(false);
    }
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`/api/articles/${id}`, {
          method: 'DELETE',
          body: JSON.stringify({ articleId: id }),
        })
        if (response.ok) {
          fetchArticles()
        } else {
          const errorData = await response.json()
          console.error('Error deleting article:', errorData)
          alert('Failed to delete article')
        }
      } catch (error) {
        console.error('Error deleting article:', error)
        alert('Failed to delete article')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingArticle(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      images: [],
      category: '',
      sizes: [],
      inStock: true,
      liveId: ''
    })
    imageUploads.forEach(upload => URL.revokeObjectURL(upload.preview))
    setImageUploads([])
    setUploadingImages(false)
    setNewSize('')
  }

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Articles Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          <Plus size={20} className="mr-2" />
          Add Article
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingArticle ? 'Edit Article' : 'Add New Article'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-4">Images</label>

                <div className="flex gap-2 mb-4">
                  <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                    <Upload size={16} className="mr-2" />
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Add URL
                  </button>

                  {imageUploads.some(upload => !upload.uploaded && !upload.uploading) && (
                    <button
                      type="button"
                      onClick={uploadImages}
                      disabled={uploadingImages}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload All'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Uploaded Images */}
                  {formData.images.map((image, index) => (
                    <div key={`uploaded-${index}`} className="relative group">
                      <Image
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        width={150}
                        height={150}
                      />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Pending Uploads */}
                  {imageUploads.map((upload, index) => (
                    <div key={`upload-${index}`} className="relative group">
                      <Image
                        src={upload.preview}
                        alt={`Upload ${index + 1}`}
                        className={`w-full h-32 object-cover rounded-lg border ${upload.uploading ? 'opacity-50' : ''
                          }`}
                        width={150}
                        height={150}
                      />

                      {upload.uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="text-white text-sm">Uploading...</div>
                        </div>
                      )}

                      {upload.uploaded && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">✓ Uploaded</div>
                        </div>
                      )}

                      {upload.error && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">Failed</div>
                        </div>
                      )}

                      {!upload.uploaded && (
                        <button
                          type="button"
                          onClick={() => removeImageUpload(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Casual, Formal, Party"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Sizes Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Sizes</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="e.g., S, M, L, XL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    Add Size
                  </button>
                </div>

                {formData.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Featured in Live</label>
                <select
                  name="liveId"
                  value={formData.liveId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Not featured in any live</option>
                  {lives.map((live) => (
                    <option key={live.id} value={live.id}>
                      {live.title} - {new Date(live.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium">In Stock</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  {uploadingImages ? 'Uploading Images...' : editingArticle ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow-sm">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No articles created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => {
                  const images = article.images || []
                  const primaryImage = images[0]?.url
                  const sizes = article.sizes.map(sizeObj => sizeObj.size).join(', ') || ''

                  return (
                    <tr key={article.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            {primaryImage ? (
                              <>
                                <Image className="h-10 w-10 rounded object-cover" src={primaryImage}
                                  width={150}
                                  height={150}
                                  alt='Article Image'
                                />
                                {images.length > 1 && (
                                  <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {images.length}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                <ShoppingBag size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{article.name}</div>
                            <div className="text-sm text-gray-500">
                              {sizes && `Sizes: ${sizes}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        Rs. {article.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {article.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${article.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {article.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingArticle(article)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}