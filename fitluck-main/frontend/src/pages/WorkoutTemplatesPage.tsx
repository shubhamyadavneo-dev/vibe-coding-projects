import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { CreateWorkoutTemplateModal } from '../components/workout-templates/CreateWorkoutTemplateModal'
import { WorkoutTemplateCard } from '../components/workout-templates/WorkoutTemplateCard'
import { EmptyState, LoadingBlock, PageTitle } from '../components/Ui'
import type { WorkoutTemplate } from '../types/api'

export function WorkoutTemplatesPage() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)

  useEffect(() => {
    void loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<WorkoutTemplate[]>('/workout-templates')
      setTemplates(response.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: { name: string; exercises: { name: string; sets: number; reps: number }[] }) => {
    setError('')
    setMessage('')

    try {
      await api.post('/workout-templates', data)
      setModalOpen(false)
      setMessage('Template saved successfully')
      await loadTemplates()
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }

  const handleDelete = async (id: string) => {
    setError('')
    setMessage('')

    try {
      await api.delete(`/workout-templates/${id}`)
      setMessage('Template deleted')
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null)
      }
      await loadTemplates()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleUse = (template: WorkoutTemplate) => {
    setSelectedTemplate(template)
    setMessage(`Selected template: ${template.name}`)
  }

  const handleShare = async (template: WorkoutTemplate) => {
    setError('')
    try {
      if (!template.is_public) {
        await api.post(`/workout-templates/${template.id}/share`)
        await loadTemplates()
      }
      
      const shareUrl = `${window.location.origin}/shared-template/${template.id}`
      await navigator.clipboard.writeText(shareUrl)
      setMessage('Share link copied to clipboard!')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle kicker="Templates" title="Workout templates" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-stone-500 dark:text-stone-400">
          Save reusable workouts with exercise sets and reps. Use the template to keep future training consistent.
        </p>
        <button type="button" onClick={() => setModalOpen(true)} className="fit-button">
          Create template
        </button>
      </div>

      {selectedTemplate && (
        <div className="fit-card p-5 text-sm text-stone-900 dark:text-stone-100">
          <p className="font-semibold">Selected template:</p>
          <p className="mt-2">{selectedTemplate.name}</p>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {message && <div className="rounded-lg border border-lime-200 bg-lime-50 p-4 text-sm font-semibold text-lime-800">{message}</div>}

      {loading ? (
        <LoadingBlock />
      ) : templates.length === 0 ? (
        <EmptyState title="No workout templates" detail="Create a template to save a custom workout." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {templates.map((template) => (
            <WorkoutTemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplate?.id === template.id}
              onUse={() => handleUse(template)}
              onDelete={() => handleDelete(template.id)}
              onShare={() => handleShare(template)}
            />
          ))}
        </div>
      )}

      <CreateWorkoutTemplateModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  )
}
