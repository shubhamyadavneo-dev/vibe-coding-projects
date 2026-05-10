import { Loader2 } from 'lucide-react'

export function StatCard({
  label,
  value,
  tone = 'dark',
}: {
  label: string
  value: string | number
  tone?: 'dark' | 'lime' | 'white'
}) {
  const toneClass =
    tone === 'lime'
      ? 'border-lime-200 bg-lime-100 text-lime-950 dark:border-lime-800 dark:bg-lime-900 dark:text-lime-100'
      : tone === 'dark'
        ? 'border-stone-900 bg-stone-950 text-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'
        : 'border-stone-200 bg-white text-stone-950 dark:text-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  )
}

export function PageTitle({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-lime-700">{kicker}</p>
      <h1 className="mt-1 text-2xl font-black text-stone-950 dark:text-stone-100 dark:text-stone-100 sm:text-3xl">{title}</h1>
    </div>
  )
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="fit-card p-6 text-center">
      <p className="text-base font-bold text-stone-950 dark:text-stone-100 dark:text-stone-100">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{detail}</p>
    </div>
  )
}

export function LoadingBlock() {
  return (
    <div className="fit-card flex min-h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-lime-700" />
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>
}
