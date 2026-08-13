import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import PublicLayout from '@/components/layout/PublicLayout'
import SEOHead from '@/components/seo/SEOHead'
import RecipeGrid from '@/components/recipe/RecipeGrid'
import { useSearch } from '@/hooks/useSearch'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(initialQuery)

  const { query, results, loading, error, searched, search } = useSearch(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = inputValue.trim()
    if (q) {
      setSearchParams({ q })
      search(q)
    }
  }

  const handleClear = () => {
    setInputValue('')
    setSearchParams({})
    search('')
  }

  return (
    <PublicLayout>
      <SEOHead
        title={query ? `Search: "${query}"` : 'Search Recipes'}
        description="Search thousands of recipes on Recipet by name, ingredient, or dish type."
        canonical="/search"
        noIndex={!!query}
      />

      <div className="section-container py-12 max-w-4xl">
        {/* Search heading */}
        <h1
          className="font-serif text-[#24211F] mb-6"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
          }}
        >
          {query ? `Results for "${query}"` : 'Search Recipes'}
        </h1>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex items-center gap-3 bg-white border border-[#E9E1D8] rounded-lg px-4 py-3 shadow-sm focus-within:border-[#E4573D] transition-colors">
            <Search size={20} className="text-[#6F6862] flex-shrink-0" />
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search recipes, ingredients, or dishes..."
              className="flex-1 text-[1rem] text-[#24211F] bg-transparent border-none outline-none placeholder:text-[#6F6862]"
              aria-label="Search recipes"
              autoFocus
              id="search-page-input"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[#6F6862] hover:text-[#24211F]"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
            <button type="submit" className="btn-primary text-sm px-5 py-2" id="search-submit-btn">
              Search
            </button>
          </div>
        </form>

        {/* Results count */}
        {searched && !loading && (
          <p className="text-sm text-[#6F6862] mb-6">
            {results.length > 0
              ? `Found ${results.length} recipe${results.length === 1 ? '' : 's'}`
              : ''}
          </p>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-10">
            <p className="text-[#E4573D] font-medium mb-2">Search failed</p>
            <p className="text-[#6F6862] text-sm">{error}</p>
          </div>
        )}

        {/* Results grid */}
        {(loading || results.length > 0) ? (
          <RecipeGrid recipes={results} loading={loading} columns={3} skeletonCount={6} />
        ) : searched && !loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">🔍</div>
            <h2
              className="font-serif text-[#24211F] mb-3"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.5rem' }}
            >
              No recipes found
            </h2>
            <p className="text-[#6F6862] mb-6 leading-relaxed">
              We couldn't find any recipes matching <strong>"{query}"</strong>.
              <br />
              Try a different ingredient or dish name.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={handleClear} className="btn-secondary text-sm">
                Clear search
              </button>
              <Link to="/recipes" className="btn-primary text-sm">
                Browse all recipes
              </Link>
            </div>
          </div>
        ) : !searched ? (
          <div className="text-center py-16 text-[#6F6862]">
            <div className="text-5xl mb-4">🍳</div>
            <p className="text-[0.9375rem]">Type something above to find your next favourite recipe.</p>
          </div>
        ) : null}
      </div>
    </PublicLayout>
  )
}
