export interface Live {
  id: string
  title: string
  description?: string
  date: Date
  videoUrl?: string
  thumbnail?: string
  articles: Article[]
  createdAt: Date
  updatedAt: Date
}

export interface Article {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  category?: string
  size?: string
  color?: string
  inStock: boolean
  liveId?: string
  live?: Live
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode?: string
  items: OrderItem[]
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  articleId: string
  quantity: number
  price: number
}

export interface CartItem {
  article: Article
  quantity: number
}