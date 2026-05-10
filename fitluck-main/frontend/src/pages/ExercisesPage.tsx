// import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { EmptyState, LoadingBlock, PageTitle } from '../components/Ui'
import type { Exercise, MuscleGroup } from '../types/api'

const muscles: Array<MuscleGroup | 'ALL'> = ['ALL', 'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS', 'CARDIO']

export function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [muscle, setMuscle] = useState<MuscleGroup | 'ALL'>('ALL')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMessage('')
      try {
        const url = muscle === 'ALL' ? '/exercises' : `/exercises?muscle=${muscle}`
        const { data } = await api.get<Exercise[]>(url)
        setExercises(data)
      } catch (err) {
        setMessage(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [muscle])

  const filtered = useMemo(() => {
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(query.toLowerCase()))
  }, [exercises, query])

  return (
    <div className="space-y-6">
      <PageTitle kicker="Library" title="Exercise catalog" />
      <div className="fit-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
          <div className="relative">
            {/* <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" /> */}
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="fit-input pl-10" placeholder="Search exercises" />
          </div>
          <select value={muscle} onChange={(event) => setMuscle(event.target.value as MuscleGroup | 'ALL')} className="fit-input">
            {muscles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      {message && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div>}
      {loading ? (
        <LoadingBlock />
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exercise) => (
            <article key={exercise.id} className="fit-card overflow-hidden">
              <div className="aspect-[16/9] bg-stone-200">
                {exercise.image_url ? <img src={exercise.image_url} alt={exercise.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="p-4">
                <span className="fit-chip">{exercise.muscle?.group || 'Exercise'}</span>
                <h2 className="mt-3 text-lg font-black text-stone-950 dark:text-stone-100 dark:text-stone-100">{exercise.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-stone-500">{exercise.description || exercise.instructions}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No exercises found" detail="Try another muscle group or search term." />
      )}
    </div>
  )
}
