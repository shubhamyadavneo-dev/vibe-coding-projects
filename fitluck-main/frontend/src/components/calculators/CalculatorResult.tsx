export function CalculatorResult({
  title,
  value,
  unit,
  category,
  description,
  tone = 'lime',
}: {
  title: string
  value: string | number
  unit?: string
  category?: string
  description: string
  tone?: 'lime' | 'dark' | 'success' | 'warning' | 'danger'
}) {
  const toneClass = {
    lime: 'border-lime-200 bg-lime-50 dark:border-lime-800 dark:bg-lime-950',
    dark: 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    danger: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
  }

  const textTone = {
    lime: 'text-lime-950 dark:text-lime-100',
    dark: 'text-stone-950 dark:text-stone-100',
    success: 'text-green-950 dark:text-green-100',
    warning: 'text-yellow-950 dark:text-yellow-100',
    danger: 'text-red-950 dark:text-red-100',
  }

  const secondaryTextTone = {
    lime: 'text-lime-700 dark:text-lime-300',
    dark: 'text-stone-700 dark:text-stone-300',
    success: 'text-green-700 dark:text-green-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    danger: 'text-red-700 dark:text-red-300',
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${toneClass[tone]}`}>
      <div className="space-y-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide opacity-70 ${textTone[tone]}`}>{title}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className={`text-4xl font-black ${textTone[tone]}`}>{value}</p>
            {unit && <p className={`text-lg font-semibold ${secondaryTextTone[tone]}`}>{unit}</p>}
          </div>
        </div>

        {category && <div className={`text-sm font-bold ${secondaryTextTone[tone]}`}>{category}</div>}

        <p className={`text-sm font-medium ${secondaryTextTone[tone]}`}>{description}</p>
      </div>
    </div>
  )
}
