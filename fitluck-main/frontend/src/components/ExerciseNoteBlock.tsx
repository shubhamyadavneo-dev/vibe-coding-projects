import { useEffect, useState } from 'react'
import { Check, Edit3 } from 'lucide-react'
import { api } from '../api/client'

export function ExerciseNoteBlock({ exerciseId }: { exerciseId: number }) {
  const [note, setNote] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<{ note: string }>(`/notes/${exerciseId}`)
        if (data) setNote(data.note)
      } catch {
        // Ignore, maybe no note exists
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [exerciseId])

  const handleSave = async () => {
    try {
      await api.post(`/notes/${exerciseId}`, { note })
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return null

  if (!isEditing && !note) {
    return (
      <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 mt-2">
        <Edit3 className="w-3 h-3" /> Add personal note
      </button>
    )
  }

  if (!isEditing && note) {
    return (
      <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-900 rounded-lg text-sm group relative">
        <p className="text-stone-700 dark:text-stone-300 pr-6">{note}</p>
        <button onClick={() => setIsEditing(true)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-600">
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="mt-3 relative">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="fit-input text-sm min-h-20 pb-10"
        placeholder="E.g. Keep elbows tucked..."
        autoFocus
      />
      <div className="absolute bottom-2 right-2 flex gap-2">
        <button onClick={() => setIsEditing(false)} className="px-2 py-1 text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded">Cancel</button>
        <button onClick={handleSave} className="px-2 py-1 text-xs font-bold bg-indigo-500 text-white rounded hover:bg-indigo-600 flex items-center gap-1">
          <Check className="w-3 h-3" /> Save
        </button>
      </div>
    </div>
  )
}
