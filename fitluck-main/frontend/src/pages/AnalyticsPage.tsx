import { useEffect, useMemo, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { CompletionChart, VolumeChart } from '../components/Charts'
import { EmptyState, LoadingBlock, PageTitle, StatCard } from '../components/Ui'
import type { CalendarDay, Consistency, Stats, StrengthPoint } from '../types/api'

export function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [consistency, setConsistency] = useState<Consistency | null>(null)
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [strength, setStrength] = useState<StrengthPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [statsRes, consistencyRes, calendarRes] = await Promise.all([
          api.get<Stats>('/analytics/stats'),
          api.get<Consistency>('/analytics/consistency'),
          api.get<CalendarDay[]>('/analytics/calendar'),
        ])
        setStats(statsRes.data)
        setConsistency(consistencyRes.data)
        setCalendar(calendarRes.data)
      } catch (err) {
        setMessage(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    async function loadStrength() {
      const firstExerciseId = 1
      try {
        const { data } = await api.get<StrengthPoint[]>(`/analytics/strength/${firstExerciseId}`)
        setStrength(data)
      } catch {
        setStrength([])
      }
    }
    void loadStrength()
  }, [])

  const strengthLabels = useMemo(() => strength.slice(-8).map((point) => point.date), [strength])
  const strengthValues = useMemo(() => strength.slice(-8).map((point) => point.weight_kg || 0), [strength])

  if (loading) return <LoadingBlock />

  return (
    <div className="space-y-6">
      <PageTitle kicker="Analytics" title="Numbers that keep you honest" />
      {message && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Workouts" value={stats?.totalWorkouts || 0} tone="dark" />
        <StatCard label="Logs" value={stats?.totalLogs || 0} tone="white" />
        <StatCard label="Sets" value={stats?.totalSets || 0} tone="white" />
        <StatCard label="Exercises" value={stats?.totalExercises || 0} tone="lime" />
        <StatCard label="Volume" value={`${Math.round(stats?.totalVolume || 0)}kg`} tone="white" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Consistency</h2>
          <div className="relative mx-auto h-64 max-w-64">
            <CompletionChart value={consistency?.completionRate || 0} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-4xl font-black text-stone-950 dark:text-stone-100">{consistency?.completionRate || 0}%</p>
                <p className="text-sm font-semibold text-stone-500">complete</p>
              </div>
            </div>
          </div>
        </section>
        <section className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Strength sample</h2>
          <div className="h-64">
            {strength.length ? <VolumeChart labels={strengthLabels} values={strengthValues} /> : <EmptyState title="No strength data" detail="Log sets to populate this chart." />}
          </div>
        </section>
      </div>

      <section className="fit-card overflow-hidden">
        <div className="border-b border-stone-200 p-4">
          <h2 className="text-lg font-black text-stone-950 dark:text-stone-100">Calendar</h2>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {calendar.slice(0, 24).map((day) => (
            <div key={day.id} className={`rounded-lg border p-3 ${day.completed ? 'border-lime-200 bg-lime-50' : 'border-stone-200 bg-white'}`}>
              <p className="text-sm font-black text-stone-950 dark:text-stone-100">{new Date(day.date).toLocaleDateString()}</p>
              <p className="text-xs font-semibold text-stone-500">{day.label || day.day_of_week}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
