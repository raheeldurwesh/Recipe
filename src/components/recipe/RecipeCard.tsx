import { Link } from 'react-router-dom'
import { Clock, Users } from 'lucide-react'
import type { RecipeWithCategory } from '@/types'
import { formatTime, getPlaceholderImage } from '@/lib/utils'

interface RecipeCardProps {
  recipe: RecipeWithCategory
  variant?: 'default' | 'large' | 'horizontal' | 'compact'
  className?: string
  loading?: 'lazy' | 'eager'
}

export default function RecipeCard({
  recipe,
  variant = 'default',
  className = '',
  loading = 'lazy',
}: RecipeCardProps) {
  const imgSrc = recipe.main_image || getPlaceholderImage(recipe.slug)

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/recipes/${recipe.slug}`}
        className={`flex gap-4 group bg-white border border-[#E9E1D8] rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}
        aria-label={`View recipe: ${recipe.title}`}
      >
        <div className="w-28 sm:w-32 flex-shrink-0 overflow-hidden">
          <img
            src={imgSrc}
            alt={recipe.title}
            loading={loading}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ aspectRatio: '1 / 1' }}
          />
        </div>
        <div className="py-3 pr-3 flex flex-col justify-center gap-1.5 min-w-0">
          {recipe.category && (
            <span className="category-badge">{recipe.category.name}</span>
          )}
          <h3 className="text-[0.9375rem] font-serif font-normal text-[#24211F] leading-snug line-clamp-2 group-hover:text-[#E4573D] transition-colors"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-[#6F6862]">
            {recipe.total_time > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatTime(recipe.total_time)}
              </span>
            )}
            {recipe.servings > 0 && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {recipe.servings}
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'large') {
    return (
      <Link
        to={`/recipes/${recipe.slug}`}
        className={`group recipe-card block ${className}`}
        aria-label={`View recipe: ${recipe.title}`}
      >
        <div className="overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
          <img
            src={imgSrc}
            alt={recipe.title}
            loading={loading}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="p-5 sm:p-6">
          {recipe.category && (
            <span className="category-badge mb-2 inline-block">{recipe.category.name}</span>
          )}
          <h2
            className="text-[1.5rem] sm:text-[1.75rem] font-serif font-normal text-[#24211F] leading-tight group-hover:text-[#E4573D] transition-colors line-clamp-2 mb-3"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            {recipe.title}
          </h2>
          {recipe.description && (
            <p className="text-sm text-[#6F6862] leading-relaxed line-clamp-2 mb-4">
              {recipe.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-[#6F6862]">
            {recipe.total_time > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {formatTime(recipe.total_time)}
              </span>
            )}
            {recipe.servings > 0 && (
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {recipe.servings} servings
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Default card
  return (
    <Link
      to={`/recipes/${recipe.slug}`}
      className={`group recipe-card block ${className}`}
      aria-label={`View recipe: ${recipe.title}`}
    >
      <div className="overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
        <img
          src={imgSrc}
          alt={recipe.title}
          loading={loading}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400"
        />
      </div>
      <div className="p-4">
        {recipe.category && (
          <span className="category-badge mb-1.5 inline-block">{recipe.category.name}</span>
        )}
        <h3
          className="text-[1.0625rem] font-serif font-normal text-[#24211F] leading-snug group-hover:text-[#E4573D] transition-colors line-clamp-2 mb-2"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-[0.8125rem] text-[#6F6862] leading-relaxed line-clamp-2 mb-3">
            {recipe.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-[#6F6862]">
          {recipe.total_time > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {formatTime(recipe.total_time)}
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={12} />
              {recipe.servings}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// Skeleton loader for RecipeCard
export function RecipeCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'large' | 'horizontal' }) {
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 bg-white border border-[#E9E1D8] rounded-lg overflow-hidden">
        <div className="w-28 sm:w-32 flex-shrink-0 skeleton" style={{ aspectRatio: '1 / 1' }} />
        <div className="py-3 pr-3 flex flex-col justify-center gap-2 flex-1">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E9E1D8] rounded-lg overflow-hidden">
      <div
        className="skeleton w-full"
        style={{ aspectRatio: variant === 'large' ? '16 / 10' : '4 / 3' }}
      />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-24 rounded mt-3" />
      </div>
    </div>
  )
}
