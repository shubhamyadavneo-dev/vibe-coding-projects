import type { ProgressPhoto } from '../types/api'
import { PhotoCard } from './PhotoCard'

interface PhotoGalleryProps {
  photos: ProgressPhoto[]
  onDelete: (id: number) => void
}

export function PhotoGallery({ photos, onDelete }: PhotoGalleryProps) {
  if (!photos.length) {
    return (
      <div className="rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-600 dark:bg-stone-800">
        <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">No photos uploaded yet</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">Upload your first progress photo to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} onDelete={onDelete} />
      ))}
    </div>
  )
}
