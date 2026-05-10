import { Form, Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'
import { type IdealWeightResult, validateHeight, calculateIdealWeight } from '../../../utils/fitnessCalculators'
import { FieldError } from '../../Ui'

const validationSchema = Yup.object({
  height: Yup.number()
    .typeError('Height must be a number')
    .required('Height is required')
    .positive('Height must be positive')
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm'),
})

export function IdealWeightCalculator() {
  const [result, setResult] = useState<IdealWeightResult | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-950 dark:text-stone-100">Ideal Weight Calculator</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Find your healthy weight range using the Devine Formula with a ±10% variation for individual differences.
        </p>
      </div>

      <div className="fit-card p-6">
        <Formik
          initialValues={{ height: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (validateHeight(values.height)) {
              const idealWeightResult = calculateIdealWeight(Number(values.height))
              setResult(idealWeightResult)
            }
          }}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-4">
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

              <button type="submit" disabled={isSubmitting} className="fit-button w-full">
                Calculate Ideal Weight
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="fit-card rounded-lg border-2 border-lime-200 bg-lime-50 p-6 dark:border-lime-800 dark:bg-lime-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-lime-700 dark:text-lime-300">For Males</p>
              <div className="mt-3 flex items-baseline gap-1">
                <p className="text-3xl font-black text-lime-950 dark:text-lime-100">{result.maleLowerBound}</p>
                <p className="text-lg font-bold text-lime-700 dark:text-lime-300">-</p>
                <p className="text-3xl font-black text-lime-950 dark:text-lime-100">{result.maleUpperBound}</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-lime-700 dark:text-lime-300">kg</p>
            </div>

            <div className="fit-card rounded-lg border-2 border-lime-200 bg-lime-50 p-6 dark:border-lime-800 dark:bg-lime-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-lime-700 dark:text-lime-300">For Females</p>
              <div className="mt-3 flex items-baseline gap-1">
                <p className="text-3xl font-black text-lime-950 dark:text-lime-100">{result.femaleLowerBound}</p>
                <p className="text-lg font-bold text-lime-700 dark:text-lime-300">-</p>
                <p className="text-3xl font-black text-lime-950 dark:text-lime-100">{result.femaleUpperBound}</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-lime-700 dark:text-lime-300">kg</p>
            </div>
          </div>

          <div className="fit-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">About These Ranges</p>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{result.description}</p>
            <div className="mt-3 space-y-2 text-xs text-stone-500">
              <p>• These ranges are guidelines, not absolute values</p>
              <p>• Muscle mass vs. fat composition affects these numbers</p>
              <p>• Consult a healthcare provider for personalized advice</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
