import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { PhotoGallery } from '../components/progress-photos/PhotoGallery'
import { UploadPhotoModal } from '../components/progress-photos/UploadPhotoModal'
import { EmptyState, LoadingBlock, PageTitle } from '../components/Ui'
import type { ProgressPhoto } from '../types/api'

export function ProgressPhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { data } = await api.get<ProgressPhoto[]>('/progress-photos')
      setPhotos(data)
    } catch (err) {
      setMessage(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [])

  const handleUpload = async (formData: { imageData: string; date: string; note: string }) => {
    try {
        console.log("Need to call the api", formData)
        
      await api.post('/progress-photos', {
        imageData: formData.imageData,
        date: formData.date,
        note: formData.note
      })
      await load()
    } catch (err) {
      setMessage(getErrorMessage(err))
      throw err
    }
  }

  const handleDelete = async (photoId: number) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return

    try {
      await api.delete(`/progress-photos/${photoId}`)
      await load()
    } catch (err) {
      setMessage(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingBlock />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle kicker="Gallery" title="Your progress photos" />
        <button type="button" onClick={() => setIsUploadOpen(true)} className="fit-button">
          <Plus className="h-4 w-4" />
          Upload photo
        </button>
      </div>

      {message && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div>}

      {photos.length === 0 ? (
        <EmptyState
          title="No photos yet"
          detail="Upload your first progress photo to track your fitness journey."
        />
      ) : (
        <PhotoGallery photos={photos} onDelete={handleDelete} />
      )}

      <UploadPhotoModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSubmit={handleUpload} />
    </div>
  )
}
