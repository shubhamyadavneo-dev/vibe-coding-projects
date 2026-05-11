import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { LoadingBlock, PageTitle } from '../components/Ui'
import type { PlanDay } from '../types/api'

export function CalendarPage() {
  const [days, setDays] = useState<PlanDay[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<PlanDay[]>('/plan/days')
        setDays(data)
      } catch (err) {
        setMessage(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) return <LoadingBlock />

  // Group by month
  const months: Record<string, PlanDay[]> = {}
  days.forEach((day) => {
    const d = new Date(day.scheduled_date)
    const key = d.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!months[key]) months[key] = []
    months[key].push(day)
  })

  return (
    <div className="space-y-6">
      <PageTitle kicker="Schedule" title="Workout Calendar" />
      {message && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div>}

      {Object.entries(months).map(([month, monthDays]) => (
        <section key={month} className="fit-card p-5">
          <h2 className="mb-4 text-xl font-black text-stone-950 dark:text-stone-100">{month}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {monthDays.map((day) => {
              const d = new Date(day.scheduled_date)
              const isPast = d < new Date(new Date().setHours(0,0,0,0))
              const isToday = d.toDateString() === new Date().toDateString()
              const completed = day.workoutLog?.completed

              let statusClass = "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700" // future
              if (completed) {
                statusClass = "bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300"
              } else if (isPast) {
                statusClass = "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 opacity-60"
              } else if (isToday) {
                statusClass = "bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500"
              }

              return (
                <div key={day.id} className={`flex flex-col p-3 rounded-xl border ${statusClass}`}>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-2xl font-black mt-1">
                    {d.getDate()}
                  </span>
                  <span className="text-xs font-medium mt-2 truncate" title={day.label || day.workout_type}>
                    {day.label || day.workout_type}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {!days.length && !loading && (
        <div className="p-10 text-center text-stone-500">
          No workout days scheduled. Generate a plan first.
        </div>
      )}
    </div>
  )
}
