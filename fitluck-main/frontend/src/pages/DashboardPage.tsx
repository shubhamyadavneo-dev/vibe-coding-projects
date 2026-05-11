import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import { CompletionChart, WeightChart } from '../components/Charts'
import { EmptyState, LoadingBlock, PageTitle, StatCard } from '../components/Ui'
import type { Consistency, PlanDay, Stats, WeightEntry } from '../types/api'

export function DashboardPage() {
  const [today, setToday] = useState<PlanDay | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [consistency, setConsistency] = useState<Consistency | null>(null)
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [badges, setBadges] = useState<{ earned: any[], all: any[] }>({ earned: [], all: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [todayRes, statsRes, consistencyRes, weightRes, badgeRes] = await Promise.allSettled([
          api.get<PlanDay>('/plan/today'),
          api.get<Stats>('/analytics/stats'),
          api.get<Consistency>('/analytics/consistency'),
          api.get<WeightEntry[]>('/progress/weight'),
          api.get<{ earned: any[], all: any[] }>('/badges')
        ])
        if (todayRes.status === 'fulfilled') setToday(todayRes.value.data)
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
        if (consistencyRes.status === 'fulfilled') setConsistency(consistencyRes.value.data)
        if (weightRes.status === 'fulfilled') setWeights(weightRes.value.data)
        if (badgeRes.status === 'fulfilled') setBadges(badgeRes.value.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const weightLabels = useMemo(() => weights.slice(-8).map((item) => new Date(item.logged_at).toLocaleDateString()), [weights])
  const weightValues = useMemo(() => weights.slice(-8).map((item) => item.weight_kg), [weights])

  if (loading) return <LoadingBlock />

  return (
    <div className="space-y-6">
      <PageTitle kicker="Today" title="Your training cockpit" />
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed" value={stats?.totalWorkouts || 0} tone="dark" />
        <StatCard label="Sets logged" value={stats?.totalSets || 0} tone="white" />
        <StatCard label="Total volume" value={`${Math.round(stats?.totalVolume || 0)} kg`} tone="lime" />
        <StatCard label="Consistency" value={`${consistency?.completionRate || 0}%`} tone="white" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="fit-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-stone-950 dark:text-stone-100">Today’s workout</h2>
              <p className="text-sm text-stone-500">{today ? new Date(today.scheduled_date).toLocaleDateString() : 'No scheduled day'}</p>
            </div>
            <Link to="/workout" className="fit-button-secondary">Open</Link>
          </div>
          {today ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-stone-100 p-4 dark:bg-stone-800">
                <p className="text-xl font-black text-stone-950 dark:text-stone-100">{today.label || today.workout_type}</p>
                <p className="mt-1 text-sm font-semibold text-lime-700">{today.day_of_week}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(today.exercises || []).slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-lg border border-stone-200 p-3">
                    <p className="font-bold text-stone-950 dark:text-stone-100">{item.exercise.name}</p>
                    <p className="text-sm text-stone-500">{item.recommended_sets} sets x {item.recommended_reps}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No workout today" detail="Create a plan to generate scheduled training days." />
          )}
        </section>

        <section className="fit-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-950 dark:text-stone-100">Completion</h2>
            <span className="fit-chip">{consistency?.completedDays || 0}/{consistency?.totalPlanDays || 0} days</span>
          </div>
          <div className="relative mx-auto h-56 max-w-56">
            <CompletionChart value={consistency?.completionRate || 0} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p className="text-3xl font-black text-stone-950 dark:text-stone-100">{consistency?.completionRate || 0}%</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Weight trend</h2>
          <div className="h-72">
            {weights.length ? <WeightChart labels={weightLabels} values={weightValues} /> : <EmptyState title="No weight logs yet" detail="Add your first weight entry from Progress." />}
          </div>
        </section>

        <section className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Achievements</h2>
          {badges.all.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.all.map(badge => {
                const isEarned = badges.earned.some(ub => ub.badge_id === badge.id)
                return (
                  <div key={badge.id} className={`flex flex-col items-center p-3 rounded-xl border text-center ${isEarned ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50' : 'bg-stone-50 border-stone-200 dark:bg-stone-900/50 dark:border-stone-800 opacity-50 grayscale'}`}>
                    <span className="text-3xl mb-2">{badge.icon}</span>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">{badge.name}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No badges yet" detail="Keep working out to earn achievements!" />
          )}
        </section>
      </div>
    </div>
  )
}
