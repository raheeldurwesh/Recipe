import RecipeCard, { RecipeCardSkeleton } from './RecipeCard'
import type { RecipeWithCategory } from '@/types'

interface RecipeGridProps {
  recipes: RecipeWithCategory[]
  loading?: boolean
  columns?: 2 | 3 | 4
  skeletonCount?: number
  className?: string
}

const GRID_CLASSES = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export default function RecipeGrid({
  recipes,
  loading = false,
  columns = 3,
  skeletonCount = 6,
  className = '',
}: RecipeGridProps) {
  const gridClass = GRID_CLASSES[columns]

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-5 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!recipes.length) {
    return null
  }

  return (
    <div className={`grid ${gridClass} gap-5 ${className}`}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
