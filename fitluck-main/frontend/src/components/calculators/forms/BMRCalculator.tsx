import { Form, Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'
import { FieldError } from '../../Ui'
import { CalculatorResult } from '../CalculatorResult'
import { type BMRResult, validateWeight, validateHeight, validateAge, calculateBMR } from '../../../utils/fitnessCalculators'

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
})

export function BMRCalculator() {
  const [result, setResult] = useState<BMRResult | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-950 dark:text-stone-100">BMR Calculator</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Calculate your Basal Metabolic Rate - the calories your body burns at rest using the Mifflin-St Jeor formula.
        </p>
      </div>

      <div className="fit-card p-6">
        <Formik
          initialValues={{ weight: '', height: '', age: '', gender: 'male' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (validateWeight(values.weight) && validateHeight(values.height) && validateAge(values.age)) {
              const bmrResult = calculateBMR(Number(values.weight), Number(values.height), Number(values.age), values.gender as 'male' | 'female')
              setResult(bmrResult)
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

              <button type="submit" className="fit-button w-full">
                Calculate BMR
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {result && (
        <CalculatorResult title="Your BMR" value={result.bmr} unit="cal/day" description={result.description} tone="lime" />
      )}
    </div>
  )
}
