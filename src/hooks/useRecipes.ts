import { useState, useEffect, useCallback } from 'react'
import { supabase, getStorageUrl } from '@/lib/supabase'
import type { Recipe, RecipeWithCategory, SearchFilters } from '@/types'

const PER_PAGE = 12

export function useRecipes(filters: SearchFilters = {}) {
  const [recipes, setRecipes] = useState<RecipeWithCategory[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const page = filters.page ?? 1
      const perPage = filters.perPage ?? PER_PAGE
      const from = (page - 1) * perPage
      const to = from + perPage - 1

      let query = supabase
        .from('recipes')
        .select(filters.category ? '*, category:categories!inner(*)' : '*, category:categories(*)', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (filters.category) {
        query = query.eq('category.slug', filters.category)
      }

      if (filters.query) {
        query = query.ilike('title', `%${filters.query}%`)
      }

      const { data, error: err, count: total } = await query

      if (err) throw err

      const normalized = (data || []).map((r) => ({
        ...r,
        main_image: getStorageUrl(r.main_image) ?? r.main_image,
        gallery: (r.gallery || []).map((g: string) => getStorageUrl(g) ?? g),
      }))

      setRecipes(normalized as RecipeWithCategory[])
      setCount(total ?? 0)
    } catch (err) {
      console.error('[useRecipes]', err)
      setError('Failed to load recipes. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters.page, filters.perPage, filters.category, filters.query])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  return { recipes, count, loading, error, refetch: fetchRecipes }
}

export function useRecipe(slug: string) {
  const [recipe, setRecipe] = useState<RecipeWithCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetch = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: err } = await supabase
          .from('recipes')
          .select('*, category:categories(*)')
          .eq('slug', slug)
          .eq('status', 'published')
          .single()

        if (err) throw err

        const normalized = {
          ...data,
          main_image: getStorageUrl(data.main_image) ?? data.main_image,
          gallery: (data.gallery || []).map((g: string) => getStorageUrl(g) ?? g),
        }

        setRecipe(normalized as RecipeWithCategory)
      } catch (err) {
        console.error('[useRecipe]', err)
        setError('Recipe not found.')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [slug])

  return { recipe, loading, error }
}

export function useRelatedRecipes(categoryId: string | null, excludeId: string, limit = 4) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!categoryId) return

    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('recipes')
          .select('*, category:categories(*)')
          .eq('status', 'published')
          .eq('category_id', categoryId)
          .neq('id', excludeId)
          .limit(limit)

        const normalized = (data || []).map((r) => ({
          ...r,
          main_image: getStorageUrl(r.main_image) ?? r.main_image,
        }))
        setRecipes(normalized as Recipe[])
      } catch (err) {
        console.error('[useRelatedRecipes]', err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [categoryId, excludeId, limit])

  return { recipes, loading }
}

// Admin version — returns all recipes including drafts
export function useAdminRecipes() {
  const [recipes, setRecipes] = useState<RecipeWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('recipes')
        .select('*, category:categories(*)')
        .order('updated_at', { ascending: false })

      if (err) throw err

      const normalized = (data || []).map((r) => ({
        ...r,
        main_image: getStorageUrl(r.main_image) ?? r.main_image,
      }))

      setRecipes(normalized as RecipeWithCategory[])
    } catch (err) {
      console.error('[useAdminRecipes]', err)
      setError('Failed to load recipes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  return { recipes, loading, error, refetch: fetchRecipes }
}

export function useAdminRecipe(id: string | null) {
  const [recipe, setRecipe] = useState<RecipeWithCategory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetch = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: err } = await supabase
          .from('recipes')
          .select('*, category:categories(*)')
          .eq('id', id)
          .single()

        if (err) throw err
        setRecipe(data as RecipeWithCategory)
      } catch (err) {
        console.error('[useAdminRecipe]', err)
        setError('Failed to load recipe.')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id])

  return { recipe, loading, error }
}
