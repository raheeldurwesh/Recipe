import { useState, useEffect, useCallback } from 'react'
import { supabase, getStorageUrl } from '@/lib/supabase'
import type { Category } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (err) throw err

      const normalized = (data || []).map((c) => ({
        ...c,
        image_url: getStorageUrl(c.image_url) ?? c.image_url,
      }))

      setCategories(normalized as Category[])
    } catch (err) {
      console.error('[useCategories]', err)
      setError('Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, error, refetch: fetchCategories }
}

export function useCategory(slug: string) {
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetch = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: err } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .single()

        if (err) throw err

        const normalized = {
          ...data,
          image_url: getStorageUrl(data.image_url) ?? data.image_url,
        }

        setCategory(normalized as Category)
      } catch (err) {
        console.error('[useCategory]', err)
        setError('Category not found.')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [slug])

  return { category, loading, error }
}
