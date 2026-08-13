import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'
import RecipeGrid from '@/components/recipe/RecipeGrid'
import { useRecipes } from '@/hooks/useRecipes'
import { useCategories } from '@/hooks/useCategories'


const PER_PAGE = 12

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [page, setPage] = useState(1)

  const { recipes, count, loading } = useRecipes({
    query,
    category: selectedCategory,
    page,
    perPage: PER_PAGE,
  })
  const { categories } = useCategories()

  const totalPages = Math.ceil(count / PER_PAGE)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchInput.trim())
    setPage(1)
    const params: Record<string, string> = {}
    if (searchInput.trim()) params.q = searchInput.trim()
    if (selectedCategory) params.category = selectedCategory
    setSearchParams(params)
  }

  const handleCategoryChange = (slug: string) => {
    const next = slug === selectedCategory ? '' : slug
    setSelectedCategory(next)
    setPage(1)
    const params: Record<string, string> = {}
    if (query) params.q = query
    if (next) params.category = next
    setSearchParams(params)
  }

  const clearFilters = () => {
    setQuery('')
    setSearchInput('')
    setSelectedCategory('')
    setPage(1)
    setSearchParams({})
  }

  const hasFilters = query || selectedCategory

  return (
    <PublicLayout>
      <SEOHead
        title="All Recipes"
        description="Browse our complete collection of recipes — from quick weeknight dinners to impressive weekend projects. Filter by category and find your next favourite dish."
        canonical="/recipes"
      />

      {/* Page header */}
      <div className="bg-white border-b border-[#E9E1D8] py-10">
        <div className="section-container">
          <h1
            className="font-serif text-[#24211F] mb-2"
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            }}
          >
            All Recipes
          </h1>
          <p className="text-[#6F6862] text-[0.9375rem]">
            {count > 0
              ? `${count} recipe${count === 1 ? '' : 's'} to discover`
              : 'Discover your next favourite dish'}
          </p>
        </div>
      </div>

      <div className="section-container py-10">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <div className="flex items-center gap-3 bg-white border border-[#E9E1D8] rounded-lg px-4 py-3 shadow-sm focus-within:border-[#E4573D] transition-colors">
            <Search size={18} className="text-[#6F6862] flex-shrink-0" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search recipes, ingredients, or dishes..."
              className="flex-1 text-[0.9375rem] text-[#24211F] bg-transparent border-none outline-none placeholder:text-[#6F6862]"
              aria-label="Search recipes"
              id="recipes-search-input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setQuery(''); setPage(1) }}
                className="text-[#6F6862] hover:text-[#24211F]"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button type="submit" className="btn-primary text-sm px-4 py-2" id="recipes-search-btn">
              Search
            </button>
          </div>
        </form>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-[#6F6862] mr-1">
                <SlidersHorizontal size={14} />
                <span>Filter:</span>
              </div>
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                  !selectedCategory
                    ? 'bg-[#E4573D] text-white border-[#E4573D]'
                    : 'bg-white text-[#6F6862] border-[#E9E1D8] hover:border-[#24211F] hover:text-[#24211F]'
                }`}
                aria-pressed={!selectedCategory}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-[#E4573D] text-white border-[#E4573D]'
                      : 'bg-white text-[#6F6862] border-[#E9E1D8] hover:border-[#24211F] hover:text-[#24211F]'
                  }`}
                  aria-pressed={selectedCategory === cat.slug}
                >
                  {cat.name}
                </button>
              ))}

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#E4573D] hover:text-[#C9442A] transition-colors ml-1"
                >
                  <X size={14} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🍽</div>
            <h2
              className="font-serif text-[#24211F] mb-3"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.5rem' }}
            >
              No recipes found
            </h2>
            <p className="text-[#6F6862] mb-6 text-[0.9375rem]">
              {query
                ? `We couldn't find recipes matching "${query}". Try a different search.`
                : 'No recipes in this category yet. Check back soon!'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <RecipeGrid recipes={recipes} loading={loading} columns={3} />
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="px-4 text-sm text-[#6F6862]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
