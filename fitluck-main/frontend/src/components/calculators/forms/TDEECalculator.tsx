import { Form, Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'
import { FieldError } from '../../Ui'
import { activityMultipliers, type TDEEResult, validateWeight, validateHeight, validateAge, calculateBMR, calculateTDEE } from '../../../utils/fitnessCalculators'
import { CalculatorResult } from '../CalculatorResult'

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

export function TDEECalculator() {
  const [result, setResult] = useState<TDEEResult | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-950 dark:text-stone-100">TDEE Calculator</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Calculate your Total Daily Energy Expenditure based on your BMR and activity level.
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
              setResult(tdeeResult)
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

              <button type="submit" disabled={isSubmitting} className="fit-button w-full">
                Calculate TDEE
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {result && (
        <div className="space-y-3">
          <CalculatorResult title="Your TDEE" value={result.tdee} unit="cal/day" description={result.description} tone="lime" />
          <div className="fit-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 text-stone-500">Calculation Breakdown</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">BMR (Basal Metabolic Rate)</span>
                <span className="font-bold text-stone-950 dark:text-stone-100">{result.bmr} cal/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">Activity Multiplier</span>
                <span className="font-bold text-stone-950 dark:text-stone-100">{result.multiplier}x</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
