import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, ArrowLeft, Eye, Save, Loader2, ImagePlus, X } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { supabase } from '@/lib/supabase'
import { useAdminRecipe } from '@/hooks/useRecipes'
import { useCategories } from '@/hooks/useCategories'
import { slugify } from '@/lib/utils'


// ── Validation schema ──
const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  description: z.string().max(500).optional().default(''),
  category_id: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  author: z.string().min(1, 'Author required').default('Recipet Team'),
  servings: z.coerce.number().min(1).max(100).default(4),
  prep_time: z.coerce.number().min(0).max(1440).default(0),
  cook_time: z.coerce.number().min(0).max(1440).default(0),
  total_time: z.coerce.number().min(0).max(1440).default(0),
  main_image: z.string().optional().default(''),
  ingredients: z.array(z.object({
    quantity: z.string().default(''),
    unit: z.string().default(''),
    name: z.string().min(1, 'Ingredient name required'),
  })).min(1, 'Add at least one ingredient'),
  instructions: z.array(z.object({
    step: z.coerce.number(),
    title: z.string().default(''),
    content: z.string().min(5, 'Instruction content too short'),
  })).min(1, 'Add at least one instruction step'),
  status: z.enum(['draft', 'published']).default('draft'),
  seo_title: z.string().optional().default(''),
  meta_description: z.string().max(160).optional().default(''),
})

type FormValues = z.infer<typeof recipeSchema>

// ── Field section wrapper ──
function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E9E1D8] p-5 sm:p-6 space-y-4">
      <h2
        className="font-serif text-[#24211F] text-[1.0625rem] pb-3 border-b border-[#E9E1D8]"
        style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

// ── Input wrapper ──
function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#24211F] mb-1.5">
        {label} {required && <span className="text-[#E4573D]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#9A9490] mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
    </div>
  )
}

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-md border border-[#E9E1D8] text-[0.9375rem] text-[#24211F] outline-none focus:border-[#E4573D] focus:ring-2 focus:ring-[#E4573D]/10 transition-colors bg-white placeholder:text-[#9A9490]'
const TEXTAREA_CLASS = `${INPUT_CLASS} resize-y min-h-[80px]`

export default function AdminRecipeForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { categories } = useCategories()
  const { recipe: existingRecipe, loading: recipeLoading } = useAdminRecipe(isEdit ? id : null)

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [imageUploading, setImageUploading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      category_id: '',
      tags: '',
      author: 'Recipet Team',
      servings: 4,
      prep_time: 0,
      cook_time: 0,
      total_time: 0,
      main_image: '',
      ingredients: [{ quantity: '', unit: '', name: '' }],
      instructions: [{ step: 1, title: '', content: '' }],
      status: 'draft',
      seo_title: '',
      meta_description: '',
    },
  })

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  })

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions',
  })

  // Load existing recipe data
  useEffect(() => {
    if (existingRecipe) {
      reset({
        title: existingRecipe.title,
        slug: existingRecipe.slug,
        description: existingRecipe.description || '',
        category_id: existingRecipe.category_id || '',
        tags: (existingRecipe.tags || []).join(', '),
        author: existingRecipe.author,
        servings: existingRecipe.servings,
        prep_time: existingRecipe.prep_time,
        cook_time: existingRecipe.cook_time,
        total_time: existingRecipe.total_time,
        main_image: existingRecipe.main_image || '',
        ingredients: existingRecipe.ingredients?.length
          ? existingRecipe.ingredients
          : [{ quantity: '', unit: '', name: '' }],
        instructions: existingRecipe.instructions?.length
          ? existingRecipe.instructions
          : [{ step: 1, title: '', content: '' }],
        status: existingRecipe.status,
        seo_title: existingRecipe.seo_title || '',
        meta_description: existingRecipe.meta_description || '',
      })
    }
  }, [existingRecipe, reset])

  // Auto-slug from title
  const title = watch('title')
  useEffect(() => {
    if (!isEdit && title) {
      setValue('slug', slugify(title), { shouldValidate: false })
    }
  }, [title, isEdit, setValue])

  // Auto total time
  const prepTime = watch('prep_time')
  const cookTime = watch('cook_time')
  useEffect(() => {
    setValue('total_time', (Number(prepTime) || 0) + (Number(cookTime) || 0))
  }, [prepTime, cookTime, setValue])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB')
      return
    }

    setImageUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('recipe-images').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('recipe-images').getPublicUrl(fileName)
      setValue('main_image', publicUrl)
    } catch (err) {
      console.error('[ImageUpload]', err)
      alert('Image upload failed. Please try again.')
    } finally {
      setImageUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const onSubmit = async (data: FormValues, publishNow?: boolean) => {
    setSaving(true)
    setSaveStatus('idle')

    try {
      const tags = data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const ingredients = data.ingredients.map((ing) => ({
        quantity: ing.quantity || '',
        unit: ing.unit || '',
        name: ing.name,
      }))

      const instructions = data.instructions.map((inst, i) => ({
        step: i + 1,
        title: inst.title || '',
        content: inst.content,
      }))

      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        category_id: data.category_id || null,
        tags,
        author: data.author,
        servings: data.servings,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        total_time: data.total_time,
        main_image: data.main_image || null,
        gallery: [],
        ingredients,
        instructions,
        status: publishNow ? 'published' : data.status,
        seo_title: data.seo_title || null,
        meta_description: data.meta_description || null,
        updated_at: new Date().toISOString(),
      }

      if (isEdit) {
        const { error } = await supabase.from('recipes').update(payload).eq('id', id)
        if (error) throw error
      } else {
        const { data: created, error } = await supabase
          .from('recipes')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select('id')
          .single()
        if (error) throw error
        navigate(`/admin/recipes/${created.id}/edit`, { replace: true })
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err: unknown) {
      console.error('[SaveRecipe]', err)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (recipeLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#E4573D]" size={32} />
        </div>
      </AdminLayout>
    )
  }

  const mainImage = watch('main_image')

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link to="/admin/recipes" className="p-1.5 text-[#6F6862] hover:text-[#24211F] rounded">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1
            className="font-serif text-[#24211F]"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
          >
            {isEdit ? 'Edit Recipe' : 'New Recipe'}
          </h1>
        </div>
        {/* Save status */}
        {saveStatus === 'saved' && (
          <span className="text-sm text-green-600 font-medium">✓ Saved</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-500 font-medium">⚠ Save failed</span>
        )}
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* Left column — main fields */}
          <div className="space-y-6">

            {/* Basic info */}
            <FieldSection title="Basic Information">
              <Field label="Recipe Title" error={errors.title?.message} required>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. Creamy Garlic Pasta"
                  className={INPUT_CLASS}
                  id="recipe-title-input"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Slug"
                  error={errors.slug?.message}
                  hint="URL: /recipes/your-slug"
                  required
                >
                  <input
                    {...register('slug')}
                    type="text"
                    placeholder="creamy-garlic-pasta"
                    className={INPUT_CLASS}
                    id="recipe-slug-input"
                  />
                </Field>
                <Field label="Author" error={errors.author?.message} required>
                  <input
                    {...register('author')}
                    type="text"
                    placeholder="Chef Name"
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>

              <Field label="Description" error={errors.description?.message} hint="Shown under the recipe title. Max 500 characters.">
                <textarea
                  {...register('description')}
                  placeholder="A short, enticing description of this recipe…"
                  className={TEXTAREA_CLASS}
                  rows={3}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Category">
                  <select {...register('category_id')} className={INPUT_CLASS}>
                    <option value="">— No category —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tags" hint="Comma-separated, e.g. pasta, quick, italian">
                  <input
                    {...register('tags')}
                    type="text"
                    placeholder="pasta, quick, vegetarian"
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            </FieldSection>

            {/* Recipe details */}
            <FieldSection title="Recipe Details">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Servings" error={errors.servings?.message} required>
                  <input
                    {...register('servings')}
                    type="number"
                    min={1}
                    max={100}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Prep Time (min)" error={errors.prep_time?.message}>
                  <input {...register('prep_time')} type="number" min={0} className={INPUT_CLASS} />
                </Field>
                <Field label="Cook Time (min)" error={errors.cook_time?.message}>
                  <input {...register('cook_time')} type="number" min={0} className={INPUT_CLASS} />
                </Field>
                <Field label="Total Time (min)" hint="Auto-calculated">
                  <input {...register('total_time')} type="number" min={0} className={`${INPUT_CLASS} bg-[#F7F3EF]`} readOnly />
                </Field>
              </div>
            </FieldSection>

            {/* Main image */}
            <FieldSection title="Recipe Image">
              <div className="space-y-3">
                {mainImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-[#E9E1D8]" style={{ aspectRatio: '16/7' }}>
                    <img src={mainImage} alt="Recipe preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setValue('main_image', '')}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-[#24211F] rounded-full p-1 shadow"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E9E1D8] rounded-lg cursor-pointer hover:border-[#E4573D] transition-colors py-10"
                    style={{ aspectRatio: '16/7', maxHeight: '200px' }}
                  >
                    {imageUploading ? (
                      <Loader2 className="animate-spin text-[#E4573D]" size={24} />
                    ) : (
                      <>
                        <ImagePlus size={24} className="text-[#9A9490]" />
                        <span className="text-sm text-[#6F6862]">Click to upload image</span>
                        <span className="text-xs text-[#9A9490]">PNG, JPG, WebP up to 10MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#6F6862] mb-1">Or paste image URL</label>
                  <input
                    {...register('main_image')}
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </FieldSection>

            {/* Ingredients */}
            <FieldSection title="Ingredients">
              {errors.ingredients?.root && (
                <p className="text-sm text-red-500 mb-2" role="alert">{errors.ingredients.root.message}</p>
              )}
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[80px_90px_1fr_36px] gap-2 text-xs font-semibold text-[#6F6862] uppercase tracking-wider px-1">
                  <span>Qty</span>
                  <span>Unit</span>
                  <span>Ingredient</span>
                  <span />
                </div>

                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[80px_90px_1fr_36px] gap-2 items-start">
                    <input
                      {...register(`ingredients.${index}.quantity`)}
                      type="text"
                      placeholder="250"
                      className={`${INPUT_CLASS} text-sm`}
                      aria-label={`Ingredient ${index + 1} quantity`}
                    />
                    <input
                      {...register(`ingredients.${index}.unit`)}
                      type="text"
                      placeholder="g"
                      className={`${INPUT_CLASS} text-sm`}
                      aria-label={`Ingredient ${index + 1} unit`}
                    />
                    <div>
                      <input
                        {...register(`ingredients.${index}.name`)}
                        type="text"
                        placeholder="Pasta"
                        className={`${INPUT_CLASS} text-sm ${errors.ingredients?.[index]?.name ? 'border-red-400' : ''}`}
                        aria-label={`Ingredient ${index + 1} name`}
                      />
                      {errors.ingredients?.[index]?.name && (
                        <p className="text-xs text-red-500 mt-0.5">{errors.ingredients[index].name?.message}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredientFields.length === 1}
                      className="mt-1 p-2 text-[#9A9490] hover:text-red-500 disabled:opacity-30 rounded"
                      aria-label={`Remove ingredient ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => appendIngredient({ quantity: '', unit: '', name: '' })}
                className="flex items-center gap-1.5 text-sm font-medium text-[#E4573D] hover:text-[#C9442A] transition-colors mt-2"
                id="add-ingredient-btn"
              >
                <PlusCircle size={15} />
                Add ingredient
              </button>
            </FieldSection>

            {/* Instructions */}
            <FieldSection title="Instructions">
              {errors.instructions?.root && (
                <p className="text-sm text-red-500 mb-2" role="alert">{errors.instructions.root.message}</p>
              )}
              <div className="space-y-4">
                {instructionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E4573D] text-white flex items-center justify-center text-sm font-semibold mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        {...register(`instructions.${index}.title`)}
                        type="text"
                        placeholder={`Step ${index + 1} title (optional)`}
                        className={`${INPUT_CLASS} text-sm`}
                      />
                      <textarea
                        {...register(`instructions.${index}.content`)}
                        placeholder="Describe this step in detail…"
                        className={`${TEXTAREA_CLASS} text-sm ${errors.instructions?.[index]?.content ? 'border-red-400' : ''}`}
                        rows={3}
                      />
                      {errors.instructions?.[index]?.content && (
                        <p className="text-xs text-red-500">{errors.instructions[index].content?.message}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      disabled={instructionFields.length === 1}
                      className="p-2 text-[#9A9490] hover:text-red-500 disabled:opacity-30 rounded mt-1"
                      aria-label={`Remove step ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => appendInstruction({ step: instructionFields.length + 1, title: '', content: '' })}
                className="flex items-center gap-1.5 text-sm font-medium text-[#E4573D] hover:text-[#C9442A] transition-colors mt-2"
                id="add-step-btn"
              >
                <PlusCircle size={15} />
                Add step
              </button>
            </FieldSection>

            {/* SEO */}
            <FieldSection title="SEO">
              <Field label="SEO Title" hint="Leave blank to use the recipe title. Max ~60 characters.">
                <input
                  {...register('seo_title')}
                  type="text"
                  placeholder={watch('title')}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Meta Description" error={errors.meta_description?.message} hint="Max 160 characters.">
                <textarea
                  {...register('meta_description')}
                  placeholder={watch('description') || 'Describe this recipe for search engines…'}
                  className={TEXTAREA_CLASS}
                  rows={2}
                />
              </Field>
            </FieldSection>
          </div>

          {/* Right sidebar — status + actions */}
          <div className="space-y-4">
            {/* Publish box */}
            <div className="bg-white rounded-xl border border-[#E9E1D8] p-5 space-y-4 sticky top-6">
              <h2
                className="font-serif text-[#24211F] text-[1.0625rem]"
                style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
              >
                Publish
              </h2>

              <Field label="Status">
                <select {...register('status')} className={INPUT_CLASS}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary justify-center"
                  id="recipe-save-btn"
                >
                  {saving ? (
                    <><Loader2 size={15} className="animate-spin" /> Saving…</>
                  ) : (
                    <><Save size={15} /> Save Recipe</>
                  )}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                  className="btn-secondary justify-center text-sm disabled:opacity-50"
                  id="recipe-publish-btn"
                >
                  Publish Now
                </button>
                {isEdit && existingRecipe?.slug && (
                  <Link
                    to={`/recipes/${existingRecipe.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-sm text-[#6F6862] hover:text-[#24211F] py-2"
                  >
                    <Eye size={14} />
                    Preview on site
                  </Link>
                )}
              </div>

              {/* Validation errors summary */}
              {Object.keys(errors).length > 0 && (
                <div className="rounded-md bg-red-50 border border-red-100 p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Please fix these issues:</p>
                  <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                    {errors.title && <li>{errors.title.message}</li>}
                    {errors.slug && <li>{errors.slug.message}</li>}
                    {errors.author && <li>{errors.author.message}</li>}
                    {errors.servings && <li>Servings: {errors.servings.message}</li>}
                    {errors.ingredients?.root && <li>{errors.ingredients.root.message}</li>}
                    {errors.instructions?.root && <li>{errors.instructions.root.message}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
