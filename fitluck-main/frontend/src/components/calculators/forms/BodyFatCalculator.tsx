import { Form, Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'
import { type BodyFatResult, validatePositiveNumber, calculateBodyFat } from '../../../utils/fitnessCalculators'
import { FieldError } from '../../Ui'
import { CalculatorResult } from '../CalculatorResult'

const validationSchema = Yup.object({
  gender: Yup.string().required('Gender is required').oneOf(['male', 'female']),
  height: Yup.number()
    .typeError('Height must be a number')
    .required('Height is required')
    .positive('Height must be positive')
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm'),
  neck: Yup.number()
    .typeError('Neck must be a number')
    .required('Neck measurement is required')
    .positive('Neck must be positive'),
  abdomen: Yup.number()
    .typeError('Abdomen must be a number')
    .positive('Abdomen must be positive')
    .nullable(),
  hips: Yup.number()
    .typeError('Hips must be a number')
    .positive('Hips must be positive')
    .nullable(),
})

export function BodyFatCalculator() {
  const [result, setResult] = useState<BodyFatResult | null>(null)
  const [gender, setGender] = useState<'male' | 'female'>('male')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-950 dark:text-stone-100">Body Fat Calculator</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Estimate your body fat percentage using circumference measurements. Males use US Navy formula, females use Jackson-Pollock formula.
        </p>
      </div>

      <div className="fit-card p-6">
        <Formik
          initialValues={{ gender: 'male', height: '', neck: '', abdomen: '', hips: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const genderVal = values.gender as 'male' | 'female'
            setGender(genderVal)

            const abdomenVal = values.abdomen ? Number(values.abdomen) : null
            const hipsVal = values.hips ? Number(values.hips) : null

            if (genderVal === 'male' && !abdomenVal) {
              return
            }
            if (genderVal === 'female' && (!abdomenVal || !hipsVal)) {
              return
            }

            if (validatePositiveNumber(values.height) && validatePositiveNumber(values.neck)) {
              const bfResult = calculateBodyFat(genderVal, Number(values.height), Number(values.neck), abdomenVal, hipsVal)
              setResult(bfResult)
            }
          }}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="fit-label">Gender</label>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={(e) => {
                    handleChange(e)
                    setGender(e.target.value as 'male' | 'female')
                  }}
                  className="fit-input mt-1"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <FieldError message={touched.gender ? errors.gender : undefined} />
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
                <label className="fit-label">Neck (cm)</label>
                <input
                  type="number"
                  name="neck"
                  placeholder="e.g., 38"
                  value={values.neck}
                  onChange={handleChange}
                  className="fit-input mt-1"
                />
                <FieldError message={touched.neck ? errors.neck : undefined} />
                <p className="mt-1 text-xs text-stone-500">Measured just below the larynx</p>
              </div>

              {values.gender === 'male' ? (
                <div>
                  <label className="fit-label">Abdomen (cm)</label>
                  <input
                    type="number"
                    name="abdomen"
                    placeholder="e.g., 85"
                    value={values.abdomen}
                    onChange={handleChange}
                    className="fit-input mt-1"
                  />
                  <FieldError message={touched.abdomen ? errors.abdomen : undefined} />
                  <p className="mt-1 text-xs text-stone-500">Measured at navel level</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="fit-label">Abdomen (cm)</label>
                    <input
                      type="number"
                      name="abdomen"
                      placeholder="e.g., 80"
                      value={values.abdomen}
                      onChange={handleChange}
                      className="fit-input mt-1"
                    />
                    <FieldError message={touched.abdomen ? errors.abdomen : undefined} />
                  </div>

                  <div>
                    <label className="fit-label">Hips (cm)</label>
                    <input
                      type="number"
                      name="hips"
                      placeholder="e.g., 95"
                      value={values.hips}
                      onChange={handleChange}
                      className="fit-input mt-1"
                    />
                    <FieldError message={touched.hips ? errors.hips : undefined} />
                    <p className="mt-1 text-xs text-stone-500">Measured at the widest point</p>
                  </div>
                </>
              )}

              <button type="submit" disabled={isSubmitting} className="fit-button w-full">
                Calculate Body Fat
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {result && (
        <CalculatorResult
          title="Body Fat Percentage"
          value={result.bodyFatPercentage}
          unit="%"
          category={result.category}
          description={result.description}
          tone={result.category === 'Fitness' || result.category === 'Athletes' ? 'success' : 'warning'}
        />
      )}
    </div>
  )
}
