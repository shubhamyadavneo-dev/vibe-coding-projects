import { X } from 'lucide-react'
import type { ProgressPhoto } from '../../types/api'

interface PhotoCardProps {
  photo: ProgressPhoto
  onDelete: (id: number) => void
}

export function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  return (
    <div className="fit-card overflow-hidden">
      <div className="relative h-48 w-full bg-stone-200 dark:bg-stone-700">
        <img src={photo.imageData} alt="Progress" className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => onDelete(photo.id)}
          className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">{new Date(photo.date).toLocaleDateString()}</p>
        {photo.note && <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">{photo.note}</p>}
      </div>
    </div>
  )
}
