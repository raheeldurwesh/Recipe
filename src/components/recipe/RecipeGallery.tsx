import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface RecipeGalleryProps {
  mainImage: string | null
  gallery?: string[]
  title: string
}

export default function RecipeGallery({ mainImage, gallery = [], title }: RecipeGalleryProps) {
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...gallery.filter((g) => g !== mainImage),
  ]
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!allImages.length) return null

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length)
  }
  const next = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % allImages.length)
  }

  if (allImages.length === 1) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#E9E1D8]" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={allImages[0]}
          alt={title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {/* Main large image */}
        <div
          className="col-span-2 overflow-hidden rounded-lg border border-[#E9E1D8] cursor-pointer"
          style={{ aspectRatio: '4 / 3' }}
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          aria-label={`View ${title} main photo`}
          onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
        >
          <img
            src={allImages[0]}
            alt={`${title} — main`}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
            loading="eager"
          />
        </div>

        {/* Side thumbnails */}
        <div className="flex flex-col gap-2">
          {allImages.slice(1, 3).map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-[#E9E1D8] cursor-pointer flex-1"
              onClick={() => openLightbox(i + 1)}
              role="button"
              tabIndex={0}
              aria-label={`View ${title} photo ${i + 2}`}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(i + 1)}
            >
              <img
                src={img}
                alt={`${title} — photo ${i + 2}`}
                className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Image lightbox"
          aria-modal="true"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 text-white/80 hover:text-white p-2"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 text-white/80 hover:text-white p-2"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <img
            src={allImages[lightboxIndex]}
            alt={`${title} — photo ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
