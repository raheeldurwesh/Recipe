import { useState } from 'react'
import { PlusCircle, Pencil, Trash2, X, Loader2, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AdminLayout from '@/components/layout/AdminLayout'
import { useCategories } from '@/hooks/useCategories'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  description: z.string().optional().default(''),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).default(''),
})

type FormValues = z.infer<typeof categorySchema>

const INPUT_CLASS = 'w-full px-3 py-2.5 rounded-md border border-[#E9E1D8] text-[0.9375rem] text-[#24211F] outline-none focus:border-[#E4573D] focus:ring-2 focus:ring-[#E4573D]/10 transition-colors bg-white placeholder:text-[#9A9490]'

export default function AdminCategories() {
  const { categories, loading, refetch } = useCategories()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', image_url: '' },
  })

  // Auto-slug from name (only for new)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingId) {
      setValue('slug', slugify(e.target.value))
    }
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
    })
    setShowForm(true)
  }

  const openNew = () => {
    setEditingId(null)
    reset({ name: '', slug: '', description: '', image_url: '' })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    reset()
  }

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.image_url || null,
      }

      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
      }

      await refetch()
      closeForm()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      alert(msg.includes('duplicate') ? 'A category with this slug already exists.' : msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      return
    }
    setDeleting(id)
    try {
      // Check if recipes depend on this category
      const { count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id)

      if ((count ?? 0) > 0) {
        const confirmed = window.confirm(
          `This category has ${count} recipe(s). Deleting it will unlink them. Continue?`
        )
        if (!confirmed) {
          setDeleting(null)
          setDeleteConfirm(null)
          return
        }
        // Unlink recipes
        await supabase.from('recipes').update({ category_id: null }).eq('category_id', id)
      }

      await supabase.from('categories').delete().eq('id', id)
      await refetch()
    } catch (err) {
      console.error('[DeleteCategory]', err)
      alert('Failed to delete category.')
    } finally {
      setDeleting(null)
      setDeleteConfirm(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1
            className="font-serif text-[#24211F] mb-1"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
          >
            Categories
          </h1>
          <p className="text-sm text-[#6F6862]">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm" id="admin-new-category-btn">
          <PlusCircle size={15} />
          New Category
        </button>
      </div>

      {/* Category form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit category' : 'New category'}>
          <div className="w-full max-w-md bg-white rounded-xl border border-[#E9E1D8] shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9E1D8]">
              <h2 className="font-serif text-[#24211F]" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
                {editingId ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={closeForm} className="p-1 text-[#6F6862] hover:text-[#24211F]" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#24211F] mb-1.5">
                  Name <span className="text-[#E4573D]">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Breakfast"
                  className={INPUT_CLASS}
                  onChange={(e) => { register('name').onChange(e); handleNameChange(e) }}
                  id="category-name-input"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24211F] mb-1.5">
                  Slug <span className="text-[#E4573D]">*</span>
                </label>
                <input
                  {...register('slug')}
                  type="text"
                  placeholder="breakfast"
                  className={INPUT_CLASS}
                  id="category-slug-input"
                />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24211F] mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="What makes this category special…"
                  className={`${INPUT_CLASS} resize-y`}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#24211F] mb-1.5">Image URL</label>
                <input
                  {...register('image_url')}
                  type="url"
                  placeholder="https://example.com/breakfast.jpg"
                  className={INPUT_CLASS}
                />
                {errors.image_url && <p className="text-xs text-red-500 mt-1">{errors.image_url.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center" id="category-save-btn">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Category'}
                </button>
                <button type="button" onClick={closeForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories table */}
      <div className="bg-white rounded-xl border border-[#E9E1D8] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#F0EAE4]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-36 rounded" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#6F6862] text-sm mb-3">No categories yet.</p>
            <button onClick={openNew} className="btn-primary text-sm">Create your first category</button>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EAE4]">
            {categories.map((cat) => (
              <div key={cat.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[#FDFAF7] transition-colors">
                {/* Image */}
                <div className="w-12 h-12 rounded-md overflow-hidden bg-[#F5EFE8] flex-shrink-0">
                  {cat.image_url && (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#24211F]">{cat.name}</p>
                  <p className="text-xs text-[#9A9490]">/category/{cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-[#6F6862] mt-0.5 line-clamp-1">{cat.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 text-[#6F6862] hover:text-[#24211F] rounded"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleting === cat.id}
                    className={`p-1.5 rounded transition-colors ${
                      deleteConfirm === cat.id
                        ? 'text-red-600 bg-red-50'
                        : 'text-[#6F6862] hover:text-red-500'
                    }`}
                    title={deleteConfirm === cat.id ? 'Confirm delete' : 'Delete'}
                  >
                    {deleting === cat.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteConfirm && (
        <p className="text-xs text-red-500 mt-2 text-right">Click trash again to confirm deletion.</p>
      )}
    </AdminLayout>
  )
}
