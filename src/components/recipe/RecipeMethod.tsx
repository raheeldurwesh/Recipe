import type { Instruction } from '@/types'

interface RecipeMethodProps {
  instructions: Instruction[]
}

export default function RecipeMethod({ instructions }: RecipeMethodProps) {
  return (
    <section aria-labelledby="method-heading">
      <h2
        id="method-heading"
        className="text-[1.5rem] font-serif text-[#24211F] mb-6"
        style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
      >
        Method
      </h2>

      <ol className="space-y-8" aria-label="Recipe instructions">
        {instructions.map((inst) => (
          <li key={inst.step} className="flex gap-5">
            {/* Step number */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E4573D] text-white flex items-center justify-center text-sm font-semibold leading-none mt-0.5">
              {inst.step}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              {inst.title && (
                <h3
                  className="text-[1.0625rem] font-serif text-[#24211F] mb-2"
                  style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
                >
                  {inst.title}
                </h3>
              )}
              <p className="text-[0.9375rem] text-[#24211F] leading-[1.8]">
                {inst.content}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
