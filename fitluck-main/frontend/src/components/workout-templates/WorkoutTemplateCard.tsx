import { ArrowRight, Share2, Trash2 } from 'lucide-react'
import type { WorkoutTemplate } from '../../types/api'

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate
  selected?: boolean
  onUse: () => void
  onDelete: () => void
  onShare: () => void
}

export function WorkoutTemplateCard({ template, selected, onUse, onDelete, onShare }: WorkoutTemplateCardProps) {
  return (
    <div className={`fit-card overflow-hidden ${selected ? 'border-lime-400 ring-1 ring-lime-400' : ''}`}>
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Template</p>
            <h3 className="mt-2 text-lg font-black text-stone-950 dark:text-stone-100">{template.name}</h3>
            {template.is_public && <span className="text-xs text-indigo-500 font-bold">Public</span>}
          </div>
          <span className="fit-chip">{template.exercises.length} exercises</span>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">Created {new Date(template.created_at).toLocaleDateString()}</p>
        <div className="mt-5 space-y-3">
          {template.exercises.slice(0, 3).map((exercise, index) => (
            <div key={index} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm dark:border-stone-700 dark:bg-stone-900">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-stone-900 dark:text-stone-100">{exercise.name}</p>
                <p className="text-stone-500 dark:text-stone-400">{exercise.sets}x{exercise.reps}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-950">
        <button type="button" onClick={onUse} className="fit-button flex-[2] gap-2">
          <ArrowRight className="h-4 w-4" />
          Use
        </button>
        <button type="button" onClick={onShare} className="fit-button flex-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 gap-2 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 shadow-none border border-transparent">
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button type="button" onClick={onDelete} className="fit-button-secondary flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 shadow-none">
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  )
}
