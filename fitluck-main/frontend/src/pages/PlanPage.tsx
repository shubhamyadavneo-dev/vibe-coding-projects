import { Form, Formik } from 'formik'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { api, getErrorMessage } from '../api/client'
import { EmptyState, FieldError, LoadingBlock, PageTitle } from '../components/Ui'
import type { UserPlan } from '../types/api'

const schema = Yup.object({
  goal: Yup.string().required('Goal is required'),
  timeframe: Yup.string().required('Timeframe is required'),
  routine_type: Yup.string().required('Routine is required'),
  workout_type: Yup.string().required('Workout type is required'),
  start_date: Yup.string(),
})

export function PlanPage() {
  const [plan, setPlan] = useState<UserPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadPlan = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { data } = await api.get<UserPlan>('/plan')
      setPlan(data)
    } catch {
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadPlan()
    })
  }, [])

  const killPlan = async () => {
    setMessage('')
    try {
      await api.delete('/plan')
      await loadPlan()
    } catch (err) {
      setMessage(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingBlock />

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4">
        <PageTitle kicker="Plan builder" title="Shape the next block" />
        <div className="fit-card p-5">
          <Formik
            initialValues={{ goal: 'WEIGHT_LOSS', timeframe: 'THREE_MONTHS', routine_type: 'ALTERNATE', workout_type: 'FULL_BODY', start_date: '' }}
            validationSchema={schema}
            onSubmit={async (values, helpers) => {
              setMessage('')
              try {
                const payload = { ...values, start_date: values.start_date || undefined }
                const { data } = await api.post<UserPlan>('/plan', payload)
                setPlan(data)
              } catch (err) {
                setMessage(getErrorMessage(err))
              } finally {
                helpers.setSubmitting(false)
              }
            }}
          >
            {({ values, errors, touched, handleChange, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="fit-label">Goal</label>
                  <select name="goal" value={values.goal} onChange={handleChange} className="fit-input mt-1">
                    <option value="WEIGHT_LOSS">Weight loss</option>
                    <option value="MUSCLE_GAIN">Muscle gain</option>
                    <option value="STAY_HEALTHY">Stay healthy</option>
                  </select>
                  <FieldError message={touched.goal ? errors.goal : undefined} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="fit-label">Timeframe</label>
                    <select name="timeframe" value={values.timeframe} onChange={handleChange} className="fit-input mt-1">
                      <option value="THREE_MONTHS">3 months</option>
                      <option value="SIX_MONTHS">6 months</option>
                      <option value="ONE_YEAR">1 year</option>
                    </select>
                  </div>
                  <div>
                    <label className="fit-label">Routine</label>
                    <select name="routine_type" value={values.routine_type} onChange={handleChange} className="fit-input mt-1">
                      <option value="ALTERNATE">Alternate</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKEND">Weekend</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="fit-label">Workout type</label>
                    <select name="workout_type" value={values.workout_type} onChange={handleChange} className="fit-input mt-1">
                      <option value="FULL_BODY">Full body</option>
                      <option value="DOUBLE">Double split</option>
                      <option value="UNI">Single muscle</option>
                    </select>
                  </div>
                  <div>
                    <label className="fit-label">Start date</label>
                    <input name="start_date" type="date" value={values.start_date} onChange={handleChange} className="fit-input mt-1" />
                  </div>
                </div>
                {message && <p className="rounded-lg bg-stone-100 p-3 text-sm font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">{message}</p>}
                <button type="submit" disabled={isSubmitting} className="fit-button w-full">Create plan</button>
              </Form>
            )}
          </Formik>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-lime-700">Active plan</p>
            <h2 className="text-2xl font-black text-stone-950 dark:text-stone-100">{plan ? plan.goal.replace('_', ' ') : 'No active plan'}</h2>
          </div>
          {plan && (
            <button type="button" onClick={killPlan} className="fit-button-secondary">
              <Trash2 className="h-4 w-4" />
              Kill
            </button>
          )}
        </div>
        {plan ? (
          <div className="fit-card overflow-hidden">
            <div className="grid gap-3 border-b border-stone-200 bg-lime-50 p-4 sm:grid-cols-3">
              <span className="fit-chip">{plan.timeframe}</span>
              <span className="fit-chip">{plan.routine_type}</span>
              <span className="fit-chip">{new Date(plan.start_date).toLocaleDateString()}</span>
            </div>
            <div className="max-h-[620px] divide-y divide-stone-100 overflow-auto">
              {(plan.planDays || []).map((day) => (
                <div key={day.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950 dark:text-stone-100">Day {day.day_number}: {day.label || day.workout_type}</p>
                      <p className="text-sm text-stone-500">{new Date(day.scheduled_date).toLocaleDateString()} · {day.day_of_week}</p>
                    </div>
                    <span className={`fit-chip ${day.workoutLog?.completed ? 'border-lime-200 bg-lime-50 text-lime-800' : ''}`}>
                      {day.workoutLog?.completed ? 'Done' : 'Open'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No active plan" detail="Create a plan to fill your calendar with training days." />
        )}
      </section>
    </div>
  )
}
