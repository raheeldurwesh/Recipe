import { useState, useEffect, useCallback } from 'react'
import { supabase, getStorageUrl } from '@/lib/supabase'
import type { RecipeWithCategory } from '@/types'
import { trackSearch } from '@/lib/analytics'

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<RecipeWithCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim()
    setQuery(q)

    if (!q) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const { data, error: err } = await supabase
        .from('recipes')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`)
        .order('created_at', { ascending: false })
        .limit(24)

      if (err) throw err

      const normalized = (data || []).map((r) => ({
        ...r,
        main_image: getStorageUrl(r.main_image) ?? r.main_image,
      }))

      setResults(normalized as RecipeWithCategory[])
      trackSearch(q, normalized.length)
    } catch (err) {
      console.error('[useSearch]', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-search when initialQuery changes (from URL params)
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [initialQuery, search])

  return { query, setQuery, results, loading, error, searched, search }
}
