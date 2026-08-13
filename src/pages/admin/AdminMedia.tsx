import { useState, useEffect, useCallback } from 'react'
import { Upload, Trash2, Copy, Check, Loader2, Image as ImageIcon } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { supabase } from '@/lib/supabase'
import type { MediaFile } from '@/types'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.from('recipe-images').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      if (error) throw error

      const withUrls = (data || [])
        .filter((f) => f.name !== '.emptyFolderPlaceholder')
        .map((f) => {
          const { data: { publicUrl } } = supabase.storage.from('recipe-images').getPublicUrl(f.name)
          return { ...f, publicUrl } as MediaFile
        })

      setFiles(withUrls)
    } catch (err) {
      console.error('[AdminMedia fetchFiles]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    setUploadError(null)

    // Validate each file
    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed.')
        e.target.value = ''
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Each image must be under 10MB.')
        e.target.value = ''
        return
      }
    }

    setUploading(true)
    try {
      for (const file of selectedFiles) {
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('recipe-images').upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })
        if (error) throw error
      }
      await fetchFiles()
    } catch (err) {
      console.error('[AdminMedia upload]', err)
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (file: MediaFile) => {
    if (deleteConfirm !== file.id) {
      setDeleteConfirm(file.id)
      return
    }
    setDeleting(file.id)
    try {
      await supabase.storage.from('recipe-images').remove([file.name])
      await fetchFiles()
    } catch (err) {
      console.error('[AdminMedia delete]', err)
    } finally {
      setDeleting(null)
      setDeleteConfirm(null)
    }
  }

  const handleCopy = async (file: MediaFile) => {
    await navigator.clipboard.writeText(file.publicUrl)
    setCopiedId(file.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1
            className="font-serif text-[#24211F] mb-1"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '1.75rem' }}
          >
            Media Library
          </h1>
          <p className="text-sm text-[#6F6862]">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>

        <label
          className={`btn-primary text-sm cursor-pointer ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
          id="media-upload-btn"
        >
          {uploading ? (
            <><Loader2 size={15} className="animate-spin" /> Uploading…</>
          ) : (
            <><Upload size={15} /> Upload Images</>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {uploadError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700" role="alert">
          {uploadError}
        </div>
      )}

      {/* Upload hint */}
      <div className="mb-6 p-4 bg-[#FEF0EC]/50 border border-[#F5C8BC] rounded-lg text-sm text-[#6F6862]">
        <strong className="text-[#24211F]">Tip:</strong> Upload images here, then paste the URL into recipe forms. Supported formats: PNG, JPG, WebP, GIF. Max 10MB per file.
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton rounded-lg" style={{ aspectRatio: '1' }} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E9E1D8] border-dashed py-20 text-center">
          <div className="w-14 h-14 bg-[#F5EFE8] rounded-xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={24} className="text-[#9A9490]" />
          </div>
          <p className="text-[#6F6862] text-sm mb-2">No images uploaded yet.</p>
          <p className="text-xs text-[#9A9490]">Upload images above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="group bg-white border border-[#E9E1D8] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="overflow-hidden relative" style={{ aspectRatio: '1' }}>
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  loading="lazy"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopy(file)}
                    className="p-2 bg-white rounded-md text-[#24211F] hover:bg-[#F5EFE8] transition-colors"
                    title="Copy URL"
                    aria-label="Copy image URL"
                  >
                    {copiedId === file.id ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={deleting === file.id}
                    className={`p-2 rounded-md transition-colors ${
                      deleteConfirm === file.id
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-[#24211F] hover:bg-red-50 hover:text-red-600'
                    }`}
                    title={deleteConfirm === file.id ? 'Confirm delete' : 'Delete'}
                    aria-label={deleteConfirm === file.id ? 'Confirm delete image' : 'Delete image'}
                  >
                    {deleting === file.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {/* File info */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-[#24211F] truncate" title={file.name}>{file.name}</p>
                {file.metadata?.size && (
                  <p className="text-[0.6875rem] text-[#9A9490] mt-0.5">{formatBytes(file.metadata.size)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {deleteConfirm && (
        <p className="text-xs text-red-500 mt-3 text-right">Click the trash icon again to confirm permanent deletion.</p>
      )}
    </AdminLayout>
  )
}
