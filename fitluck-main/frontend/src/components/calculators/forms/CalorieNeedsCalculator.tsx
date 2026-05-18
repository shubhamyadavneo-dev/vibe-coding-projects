import { Form, Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'
import { activityMultipliers, type CalorieNeedsResult, validateWeight, validateHeight, validateAge, calculateBMR, calculateTDEE, calculateCalorieNeeds } from '../../../utils/fitnessCalculators'
import { FieldError } from '../../Ui'

const validationSchema = Yup.object({
  weight: Yup.number()
    .typeError('Weight must be a number')
    .required('Weight is required')
    .positive('Weight must be positive')
    .min(10, 'Weight must be at least 10 kg')
    .max(500, 'Weight must be less than 500 kg'),
  height: Yup.number()
    .typeError('Height must be a number')
    .required('Height is required')
    .positive('Height must be positive')
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm'),
  age: Yup.number()
    .typeError('Age must be a number')
    .required('Age is required')
    .positive('Age must be positive')
    .min(10, 'Age must be at least 10 years')
    .max(120, 'Age must be less than 120 years'),
  gender: Yup.string().required('Gender is required').oneOf(['male', 'female']),
  activityLevel: Yup.string().required('Activity level is required').oneOf(Object.keys(activityMultipliers)),
})

interface CalorieBreakdown extends CalorieNeedsResult {
  tdee: number
}

export function CalorieNeedsCalculator() {
  const [result, setResult] = useState<CalorieBreakdown | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-950 dark:text-stone-100">Calorie Needs Calculator</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Get personalized daily calorie recommendations based on your goals: maintenance, weight loss, or weight gain.
        </p>
      </div>

      <div className="fit-card p-6">
        <Formik
          initialValues={{ weight: '', height: '', age: '', gender: 'male', activityLevel: 'moderately_active' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (validateWeight(values.weight) && validateHeight(values.height) && validateAge(values.age)) {
              const bmr = calculateBMR(
                Number(values.weight),
                Number(values.height),
                Number(values.age),
                values.gender as 'male' | 'female'
              ).bmr
              const tdeeResult = calculateTDEE(bmr, values.activityLevel as keyof typeof activityMultipliers)
              const calorieNeeds = calculateCalorieNeeds(tdeeResult.tdee)
              setResult({ ...calorieNeeds, tdee: tdeeResult.tdee })
            }
          }}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="fit-label">Gender</label>
                <select name="gender" value={values.gender} onChange={handleChange} className="fit-input mt-1">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <FieldError message={touched.gender ? errors.gender : undefined} />
              </div>

              <div>
                <label className="fit-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  placeholder="e.g., 70"
                  value={values.weight}
                  onChange={handleChange}
                  className="fit-input mt-1"
                />
                <FieldError message={touched.weight ? errors.weight : undefined} />
              </div>

              <div>
                <label className="fit-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  placeholder="e.g., 180"
                  value={values.height}
                  onChange={handleChange}
                  className="fit-input mt-1"
                />
                <FieldError message={touched.height ? errors.height : undefined} />
              </div>

              <div>
                <label className="fit-label">Age (years)</label>
                <input
                  type="number"
                  name="age"
                  placeholder="e.g., 25"
                  value={values.age}
                  onChange={handleChange}
                  className="fit-input mt-1"
                />
                <FieldError message={touched.age ? errors.age : undefined} />
              </div>

              <div>
                <label className="fit-label">Activity Level</label>
                <select name="activityLevel" value={values.activityLevel} onChange={handleChange} className="fit-input mt-1">
                  {Object.entries(activityMultipliers).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <FieldError message={touched.activityLevel ? errors.activityLevel : undefined} />
              </div>

              <button type="submit" className="fit-button w-full">
                Calculate Calorie Needs
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="fit-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Maintenance</p>
              <p className="mt-2 text-3xl font-black text-stone-950 dark:text-stone-100">{result.maintenance}</p>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">cal/day (stay at current weight)</p>
            </div>

            <div className="fit-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Weight Gain</p>
              <p className="mt-2 text-3xl font-black text-stone-950 dark:text-stone-100">+{result.weightGain - result.maintenance}</p>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">cal/day surplus</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="fit-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Moderate Weight Loss</p>
              <p className="mt-2 text-3xl font-black text-stone-950 dark:text-stone-100">{result.weightLoss}</p>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">~0.5 kg/week loss</p>
            </div>

            <div className="fit-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Aggressive Weight Loss</p>
              <p className="mt-2 text-3xl font-black text-stone-950 dark:text-stone-100">{result.aggressiveWeightLoss}</p>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">~1 kg/week loss</p>
            </div>
          </div>

          <div className="fit-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Important Notes</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>• Consult a nutritionist for personalized advice</li>
              <li>• Weight loss/gain depends on diet quality, not just calories</li>
              <li>• Aggressive deficits may cause muscle loss</li>
              <li>• Monitor your progress and adjust as needed</li>
              <li>• These calculations are estimates based on formulas</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
