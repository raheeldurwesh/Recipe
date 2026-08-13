import { Link } from 'react-router-dom'
import type { Category } from '@/types'
import { CATEGORY_IMAGES } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  className?: string
}

export default function CategoryCard({ category, className = '' }: CategoryCardProps) {
  const imgSrc = category.image_url ||
    CATEGORY_IMAGES[category.slug.toLowerCase()] ||
    CATEGORY_IMAGES['dinner']

  return (
    <Link
      to={`/category/${category.slug}`}
      className={`group relative block overflow-hidden rounded-lg ${className}`}
      aria-label={`Browse ${category.name} recipes`}
      style={{ aspectRatio: '3 / 2' }}
    >
      <img
        src={imgSrc}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Category name */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3
          className="text-white font-serif text-[1.125rem] leading-tight"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          {category.name}
        </h3>
        {category.description && (
          <p className="text-white/70 text-xs mt-0.5 leading-relaxed line-clamp-1">
            {category.description}
          </p>
        )}
      </div>

      {/* Hover accent */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-[#E4573D] text-white text-xs font-semibold px-2.5 py-1 rounded-md">
          Explore →
        </div>
      </div>
    </Link>
  )
}

// Skeleton
export function CategoryCardSkeleton() {
  return (
    <div
      className="rounded-lg skeleton"
      style={{ aspectRatio: '3 / 2' }}
    />
  )
}
