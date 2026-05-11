import { Form, Formik } from 'formik'
import { X } from 'lucide-react'
import { useState } from 'react'
import * as Yup from 'yup'
import { FieldError } from '../Ui'

interface UploadPhotoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { imageData: string; date: string; note: string }) => Promise<void>
}

const uploadSchema = Yup.object({
  date: Yup.string().required('Date is required'),
  note: Yup.string()
})

export function UploadPhotoModal({ isOpen, onClose, onSubmit }: UploadPhotoModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (
    file: File | null,
    setFieldValue: (field: string, value: string | null) => void
  ) => {
    if (!file) {
      setPreview(null)
      setFieldValue('imageData', '')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WEBP images are allowed')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result as string
      setPreview(data)
      setFieldValue('imageData', data)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="fit-card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-stone-950 dark:text-stone-100">Upload photo</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Formik
          initialValues={{ date: new Date().toISOString().split('T')[0], note: '', imageData: '' }}
          validationSchema={uploadSchema}
          onSubmit={async (values) => {
            if (!values.imageData) {
              alert('Please select an image')
              return
            }
            setSubmitting(true)
            try {
                console.log({values});
                
              await onSubmit(values)
              setPreview(null)
              onClose()
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form className="space-y-4">
              {preview ? (
                <div className="relative h-40 w-full overflow-hidden rounded-lg">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 p-6 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:hover:bg-stone-700">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e.currentTarget.files?.[0] || null, setFieldValue)}
                    className="hidden"
                  />
                  <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Click to select image</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">JPG, PNG, WEBP (max 5MB)</p>
                </label>
              )}

              <div>
                <label className="fit-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={values.date}
                  onChange={(e) => setFieldValue('date', e.target.value)}
                  className="fit-input mt-1"
                />
                <FieldError message={touched.date ? errors.date : undefined} />
              </div>

              <div>
                <label className="fit-label">Notes (optional)</label>
                <textarea
                  name="note"
                  value={values.note}
                  onChange={(e) => setFieldValue('note', e.target.value)}
                  className="fit-input mt-1 min-h-20"
                  placeholder="Add notes about this photo..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={submitting || !values.imageData} className="fit-button flex-1">
                  Upload
                </button>
                <button type="button" onClick={onClose} className="fit-button-secondary flex-1">
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
