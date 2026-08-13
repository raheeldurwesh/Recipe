import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { Ingredient } from '@/types'
import { scaleQuantity } from '@/lib/utils'
import { trackServingChange } from '@/lib/analytics'

interface IngredientListProps {
  ingredients: Ingredient[]
  defaultServings: number
  recipeId: string
}

export default function IngredientList({
  ingredients,
  defaultServings,
  recipeId,
}: IngredientListProps) {
  const [servings, setServings] = useState(defaultServings)

  const multiplier = defaultServings > 0 ? servings / defaultServings : 1

  const changeServings = (delta: number) => {
    const next = Math.max(1, Math.min(100, servings + delta))
    setServings(next)
    trackServingChange(recipeId, next)
  }

  return (
    <section aria-labelledby="ingredients-heading">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2
          id="ingredients-heading"
          className="text-[1.5rem] font-serif text-[#24211F]"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          Ingredients
        </h2>

        {/* Serving adjuster */}
        <div className="flex items-center gap-0 border border-[#E9E1D8] rounded-md overflow-hidden bg-white">
          <button
            onClick={() => changeServings(-1)}
            disabled={servings <= 1}
            className="w-9 h-9 flex items-center justify-center text-[#6F6862] hover:bg-[#F5EFE8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease servings"
          >
            <Minus size={14} />
          </button>
          <div className="px-4 text-sm font-semibold text-[#24211F] border-x border-[#E9E1D8] h-9 flex items-center gap-1 whitespace-nowrap">
            <span aria-live="polite" aria-label={`${servings} servings`}>{servings}</span>
            <span className="text-[#6F6862] font-normal">servings</span>
          </div>
          <button
            onClick={() => changeServings(1)}
            disabled={servings >= 100}
            className="w-9 h-9 flex items-center justify-center text-[#6F6862] hover:bg-[#F5EFE8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase servings"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <ul className="space-y-2" aria-label="Ingredient list">
        {ingredients.map((ing, index) => (
          <li
            key={index}
            className="flex items-start gap-3 py-2.5 border-b border-[#F0EAE4] last:border-0"
          >
            <span className="w-2 h-2 rounded-full bg-[#E4573D] flex-shrink-0 mt-[0.45rem]" aria-hidden="true" />
            <span className="text-[0.9375rem] text-[#24211F] leading-relaxed">
              {multiplier !== 1 ? (
                <>
                  <strong className="font-semibold">
                    {scaleQuantity(ing.quantity, multiplier)}
                    {ing.unit && ` ${ing.unit}`}
                  </strong>{' '}
                  {ing.name}
                </>
              ) : (
                <>
                  {ing.quantity && (
                    <strong className="font-semibold">
                      {ing.quantity}{ing.unit && ` ${ing.unit}`}
                    </strong>
                  )}{' '}
                  {ing.name}
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
