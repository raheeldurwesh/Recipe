// ============================================
//   Recipet — TypeScript Types
// ============================================

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Ingredient {
  quantity: string
  unit: string
  name: string
}

export interface Instruction {
  step: number
  title: string
  content: string
}

export type RecipeStatus = 'draft' | 'published'

export interface Recipe {
  id: string
  title: string
  slug: string
  description: string | null
  main_image: string | null
  gallery: string[]
  category_id: string | null
  category?: Category | null
  tags: string[]
  servings: number
  prep_time: number // in minutes
  cook_time: number // in minutes
  total_time: number // in minutes
  ingredients: Ingredient[]
  instructions: Instruction[]
  author: string
  status: RecipeStatus
  seo_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface RecipeWithCategory extends Recipe {
  category: Category | null
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin'
  created_at: string
}

export interface MediaFile {
  name: string
  id: string
  created_at: string
  updated_at: string
  last_accessed_at: string
  metadata: {
    size: number
    mimetype: string
    cacheControl: string
  } | null
  publicUrl: string
}

// Form types
export interface RecipeFormData {
  title: string
  slug: string
  description: string
  category_id: string
  tags: string
  author: string
  servings: number
  prep_time: number
  cook_time: number
  total_time: number
  main_image: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  status: RecipeStatus
  seo_title: string
  meta_description: string
}

export interface CategoryFormData {
  name: string
  slug: string
  description: string
  image_url: string
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  perPage: number
}

export interface SearchFilters {
  query?: string
  category?: string
  tags?: string[]
  page?: number
  perPage?: number
}

// Analytics event types
export interface AnalyticsEvent {
  event_name: string
  params?: Record<string, string | number | boolean>
}
