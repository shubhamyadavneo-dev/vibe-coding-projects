import { Calculator, type LucideIcon } from 'lucide-react'

export type CalculatorType = 'bmi' | 'bmr' | 'tdee' | 'body-fat' | 'ideal-weight' | 'calorie-needs'

export interface Calculator {
  id: CalculatorType
  label: string
  description: string
  icon: LucideIcon
}

const calculators: Calculator[] = [
  {
    id: 'bmi',
    label: 'BMI Calculator',
    description: 'Calculate your Body Mass Index',
    icon: Calculator,
  },
  {
    id: 'bmr',
    label: 'BMR Calculator',
    description: 'Basal Metabolic Rate calculation',
    icon: Calculator,
  },
  {
    id: 'tdee',
    label: 'TDEE Calculator',
    description: 'Total Daily Energy Expenditure',
    icon: Calculator,
  },
  {
    id: 'body-fat',
    label: 'Body Fat Calculator',
    description: 'Estimate body fat percentage',
    icon: Calculator,
  },
  {
    id: 'ideal-weight',
    label: 'Ideal Weight Calculator',
    description: 'Find your healthy weight range',
    icon: Calculator,
  },
  {
    id: 'calorie-needs',
    label: 'Calorie Needs Calculator',
    description: 'Daily calorie recommendations',
    icon: Calculator,
  },
]

export function CalculatorSidebar({
  activeCalculator,
  onSelect,
}: {
  activeCalculator: CalculatorType
  onSelect: (id: CalculatorType) => void
}) {
  return (
    <aside className="space-y-2">
      {calculators.map((calc) => (
        <button
          key={calc.id}
          onClick={() => onSelect(calc.id)}
          className={`w-full rounded-lg border-2 p-3 text-left transition ${
            activeCalculator === calc.id
              ? 'border-lime-400 bg-lime-50 dark:border-lime-600 dark:bg-lime-950'
              : 'border-stone-200 bg-white hover:border-lime-200 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-lime-700'
          }`}
        >
          <p className="font-semibold text-stone-950 dark:text-stone-100">{calc.label}</p>
          <p className={`mt-1 text-xs ${activeCalculator === calc.id ? 'text-lime-700 dark:text-lime-300' : 'text-stone-500'}`}>
            {calc.description}
          </p>
        </button>
      ))}
    </aside>
  )
}
