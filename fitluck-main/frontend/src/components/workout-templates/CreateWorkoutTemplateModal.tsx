import { Plus, Trash2, X } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { FieldError } from '../Ui'

type ExerciseRow = {
  name: string
  sets: number | ''
  reps: number | ''
}

interface CreateWorkoutTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; exercises: { name: string; sets: number; reps: number }[] }) => Promise<void>
}

export function CreateWorkoutTemplateModal({ isOpen, onClose, onSubmit }: CreateWorkoutTemplateModalProps) {
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState<ExerciseRow[]>([
    { name: '', sets: 3, reps: 12 },
  ])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleExerciseChange = (index: number, field: keyof ExerciseRow, value: string | number) => {
    setExercises((current) =>
      current.map((exercise, itemIndex) =>
        itemIndex !== index ? exercise : { ...exercise, [field]: value }
      )
    )
  }

  const handleAddExercise = () => {
    setExercises((current) => [...current, { name: '', sets: 3, reps: 12 }])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Template name is required')
      return
    }

    const normalizedExercises = exercises.map((exercise) => ({
      name: exercise.name.trim(),
      sets: Number(exercise.sets),
      reps: Number(exercise.reps),
    }))

    if (normalizedExercises.some((exercise) => !exercise.name || exercise.sets <= 0 || exercise.reps <= 0)) {
      setError('All exercises require a name, sets, and reps')
      return
    }

    if (normalizedExercises.length === 0) {
      setError('At least one exercise is required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), exercises: normalizedExercises })
      setName('')
      setExercises([{ name: '', sets: 3, reps: 12 }])
      onClose()
    } catch (error) {
      setError('Unable to save template')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="fit-card w-full max-w-2xl p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-stone-950 dark:text-stone-100">Create workout template</h2>
            <p className="text-sm text-stone-500">Add a name and the exercises you want to reuse.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">Template name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              placeholder="Upper body strength"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Exercises</p>
              <button type="button" onClick={handleAddExercise} className="fit-button-secondary inline-flex items-center gap-2 px-3 py-2 text-sm">
                <Plus className="h-4 w-4" />
                Add exercise
              </button>
            </div>
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-950">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Exercise {index + 1}</p>
                    <button type="button" onClick={() => handleRemoveExercise(index)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Exercise name</span>
                      <input
                        value={exercise.name}
                        onChange={(event) => handleExerciseChange(index, 'name', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                        placeholder="Push Ups"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Sets</span>
                      <input
                        type="number"
                        value={exercise.sets}
                        min={1}
                        onChange={(event) => handleExerciseChange(index, 'sets', Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Reps</span>
                      <input
                        type="number"
                        value={exercise.reps}
                        min={1}
                        onChange={(event) => handleExerciseChange(index, 'reps', Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <FieldError message={error} />}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={submitting} className="fit-button w-full sm:w-auto">
              Save template
            </button>
            <button type="button" onClick={onClose} className="fit-button-secondary w-full sm:w-auto">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
