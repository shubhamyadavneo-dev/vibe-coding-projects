import { useState } from 'react'
import { PageTitle } from '../components/Ui'
import { CalculatorSidebar, type CalculatorType } from '../components/calculators/CalculatorSidebar'
import { BMICalculator } from '../components/calculators/forms/BMICalculator'
import { BMRCalculator } from '../components/calculators/forms/BMRCalculator'
import { TDEECalculator } from '../components/calculators/forms/TDEECalculator'
import { BodyFatCalculator } from '../components/calculators/forms/BodyFatCalculator'
import { IdealWeightCalculator } from '../components/calculators/forms/IdealWeightCalculator'
import { CalorieNeedsCalculator } from '../components/calculators/forms/CalorieNeedsCalculator'

const calculatorComponents: Record<CalculatorType, () => React.ReactNode> = {
  bmi: () => <BMICalculator />,
  bmr: () => <BMRCalculator />,
  tdee: () => <TDEECalculator />,
  'body-fat': () => <BodyFatCalculator />,
  'ideal-weight': () => <IdealWeightCalculator />,
  'calorie-needs': () => <CalorieNeedsCalculator />,
}

export function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('bmi')

  return (
    <div className="space-y-6">
      <PageTitle kicker="Tools" title="Fitness Calculators" />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <CalculatorSidebar activeCalculator={activeCalculator} onSelect={setActiveCalculator} />
        </div>

        <div className="lg:hidden">
          <div className="fit-card p-4 mb-6">
            <label className="fit-label">Select Calculator</label>
            <select
              value={activeCalculator}
              onChange={(e) => setActiveCalculator(e.target.value as CalculatorType)}
              className="fit-input mt-2"
            >
              <option value="bmi">BMI Calculator</option>
              <option value="bmr">BMR Calculator</option>
              <option value="tdee">TDEE Calculator</option>
              <option value="body-fat">Body Fat Calculator</option>
              <option value="ideal-weight">Ideal Weight Calculator</option>
              <option value="calorie-needs">Calorie Needs Calculator</option>
            </select>
          </div>
        </div>

        <div className="fit-card p-6 lg:p-8">
          <div className="animate-fadeIn">
            {calculatorComponents[activeCalculator]()}
          </div>
        </div>
      </div>
    </div>
  )
}
