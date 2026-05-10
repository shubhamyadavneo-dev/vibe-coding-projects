import { Form, Formik } from 'formik'
import { useState } from 'react'
import * as Yup from 'yup'
import { calculateBMI, validateHeight, validateWeight, type BMIResult } from '../../../utils/fitnessCalculators'
import { FieldError } from '../../Ui'
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
})

export function BMICalculator() {
  const [result, setResult] = useState<BMIResult | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-stone-950 dark:text-stone-100">BMI Calculator</h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Calculate your Body Mass Index to understand if your weight is healthy for your height.
        </p>
      </div>

      <div className="fit-card p-6">
        <Formik
          initialValues={{ weight: '', height: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (validateWeight(values.weight) && validateHeight(values.height)) {
              const bmiResult = calculateBMI(Number(values.weight), Number(values.height))
              setResult(bmiResult)
            }
          }}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-4">
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

              <button type="submit" disabled={isSubmitting} className="fit-button w-full">
                Calculate BMI
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {result && (
        <CalculatorResult
          title="Your BMI"
          value={result.bmi}
          unit="kg/m²"
          category={result.category}
          description={result.description}
          tone={result.category === 'Normal' ? 'success' : result.category === 'Overweight' ? 'warning' : 'danger'}
        />
      )}
    </div>
  )
}
