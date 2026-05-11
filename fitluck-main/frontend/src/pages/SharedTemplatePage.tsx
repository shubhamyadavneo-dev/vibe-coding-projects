import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import { LoadingBlock, PageTitle } from '../components/Ui'
import type { WorkoutTemplate } from '../types/api'

export function SharedTemplatePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<WorkoutTemplate & { user?: { name: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<WorkoutTemplate & { user?: { name: string } }>(`/workout-templates/shared/${id}`)
        setTemplate(data)
      } catch (err) {
        setMessage(getErrorMessage(err) || 'Template not found or not public')
      } finally {
        setLoading(false)
      }
    }
    if (id) void load()
  }, [id])

  const handleImport = async () => {
    if (!template) return
    setImporting(true)
    try {
      await api.post('/workout-templates', {
        name: `${template.name} (Imported)`,
        exercises: template.exercises
      })
      navigate('/workout-templates')
    } catch (err) {
      setMessage(getErrorMessage(err))
      setImporting(false)
    }
  }

  if (loading) return <LoadingBlock />

  if (!template) {
    return (
      <div className="space-y-6">
        <PageTitle kicker="Shared Template" title="Not found" />
        <div className="fit-card p-5 text-center text-stone-500">
          {message || 'This template is not available or is not set to public.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageTitle kicker="Shared Template" title={template.name} />
      
      {message && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div>}

      <div className="fit-card p-6 border-2 border-indigo-200 dark:border-indigo-900/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-sm text-stone-500 mb-1">Created by {template.user?.name || 'User'}</p>
            <p className="text-xs text-stone-400">{new Date(template.created_at).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={handleImport}
            disabled={importing}
            className="fit-button w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {importing ? 'Importing...' : 'Save to my templates'}
          </button>
        </div>

        <h3 className="font-bold text-lg mb-3">Exercises</h3>
        <div className="space-y-3">
          {template.exercises.map((ex, idx) => (
            <div key={idx} className="bg-stone-50 dark:bg-stone-900 p-4 rounded-xl flex justify-between items-center">
              <span className="font-bold">{ex.name}</span>
              <span className="text-sm font-medium text-stone-500 bg-stone-200 dark:bg-stone-800 px-3 py-1 rounded-full">
                {ex.sets} sets × {ex.reps} reps
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
