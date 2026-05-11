import { Form, Formik } from 'formik'
import { CheckCircle2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { api, getErrorMessage } from '../api/client'
import { EmptyState, FieldError, LoadingBlock, PageTitle } from '../components/Ui'
import { RestTimer } from '../components/RestTimer'
import { ExerciseNoteBlock } from '../components/ExerciseNoteBlock'
import type { PlanDay, WorkoutLog } from '../types/api'

const logSchema = Yup.object({
  duration_minutes: Yup.number().positive('Must be positive').nullable(),
  notes: Yup.string(),
})

const setSchema = Yup.object({
  exercise_id: Yup.number().positive().required('Exercise is required'),
  set_number: Yup.number().positive().required('Set number is required'),
  reps: Yup.number().positive().required('Reps are required'),
  weight_kg: Yup.number().min(0).nullable(),
})

export function WorkoutPage() {
  const [today, setToday] = useState<PlanDay | null>(null)
  const [log, setLog] = useState<WorkoutLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { data } = await api.get<PlanDay>('/plan/today')
      setToday(data)
      setLog(data.workoutLog || null)
    } catch (err) {
      setToday(null)
      setMessage(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [])

  const ensureLog = async () => {
    if (!today) return null
    if (log) return log
    const { data } = await api.post<WorkoutLog>(`/logs/${today.id}`, { completed: false })
    setLog(data)
    return data
  }

  if (loading) return <LoadingBlock />

  if (!today) return <EmptyState title="No workout available" detail={message || 'Create a plan with today in its schedule.'} />

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="space-y-4">
        <PageTitle kicker={new Date(today.scheduled_date).toLocaleDateString()} title={today.label || today.workout_type} />
        <RestTimer />
        <div className="grid gap-3 sm:grid-cols-2">
          {(today.exercises || []).map((item) => (
            <div key={item.id} className="fit-card p-4">
              <p className="font-black text-stone-950 dark:text-stone-100">{item.exercise.name}</p>
              <p className="mt-1 text-sm text-stone-500">{item.exercise.muscle?.name}</p>
              <p className="mt-3 text-sm font-bold text-lime-700">{item.recommended_sets} sets x {item.recommended_reps} reps</p>
              <ExerciseNoteBlock exerciseId={item.exercise.id} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Workout log</h2>
          <Formik
            enableReinitialize
            initialValues={{ duration_minutes: log?.duration_minutes || '', notes: log?.notes || '' }}
            validationSchema={logSchema}
            onSubmit={async (values, helpers) => {
              try {
                const activeLog = await ensureLog()
                if (!activeLog) return
                const { data } = await api.patch<WorkoutLog>(`/logs/${today.id}`, {
                  duration_minutes: values.duration_minutes ? Number(values.duration_minutes) : undefined,
                  notes: values.notes || undefined,
                })
                setLog(data)
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
                  <label className="fit-label">Duration</label>
                  <input name="duration_minutes" type="number" value={values.duration_minutes} onChange={handleChange} className="fit-input mt-1" placeholder="60" />
                  <FieldError message={touched.duration_minutes ? errors.duration_minutes : undefined} />
                </div>
                <div>
                  <label className="fit-label">Notes</label>
                  <textarea name="notes" value={values.notes} onChange={handleChange} className="fit-input mt-1 min-h-24" placeholder="Session notes" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button type="submit" disabled={isSubmitting} className="fit-button">Save log</button>
                  <button
                    type="button"
                    className="fit-button-secondary"
                    onClick={async () => {
                      const activeLog = await ensureLog()
                      if (!activeLog) return
                      const { data } = await api.patch<WorkoutLog>(`/logs/${today.id}`, { completed: true })
                      setLog(data)
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          {message && <p className="mt-3 text-sm font-semibold text-red-600">{message}</p>}
        </div>

        <div className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Add set</h2>
          <Formik
            initialValues={{ exercise_id: today.exercises?.[0]?.exercise.id || 0, set_number: (log?.sets?.length || 0) + 1, reps: 10, weight_kg: 0 }}
            enableReinitialize
            validationSchema={setSchema}
            onSubmit={async (values, helpers) => {
              try {
                await ensureLog()
                await api.post(`/logs/${today.id}/sets`, {
                  exercise_id: Number(values.exercise_id),
                  set_number: Number(values.set_number),
                  reps: Number(values.reps),
                  weight_kg: Number(values.weight_kg),
                })
                const { data } = await api.get<WorkoutLog>(`/logs/${today.id}`)
                setLog(data)
                helpers.resetForm()
              } catch (err) {
                setMessage(getErrorMessage(err))
              } finally {
                helpers.setSubmitting(false)
              }
            }}
          >
            {({ values, errors, touched, handleChange, isSubmitting }) => (
              <Form className="space-y-3">
                <select name="exercise_id" value={values.exercise_id} onChange={handleChange} className="fit-input">
                  {(today.exercises || []).map((item) => <option key={item.id} value={item.exercise.id}>{item.exercise.name}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <input name="set_number" type="number" value={values.set_number} onChange={handleChange} className="fit-input" />
                  <input name="reps" type="number" value={values.reps} onChange={handleChange} className="fit-input" />
                  <input name="weight_kg" type="number" value={values.weight_kg} onChange={handleChange} className="fit-input" />
                </div>
                <FieldError message={touched.exercise_id ? errors.exercise_id : undefined} />
                <button type="submit" disabled={isSubmitting} className="fit-button w-full">
                  <Plus className="h-4 w-4" />
                  Add set
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="fit-card divide-y divide-stone-100">
          {(log?.sets || []).length ? (
            (log?.sets || []).map((set) => (
              <div key={set.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold text-stone-950 dark:text-stone-100">{set.exercise?.name || `Exercise ${set.exercise_id}`}</p>
                  <p className="text-sm text-stone-500">Set {set.set_number}</p>
                </div>
                <p className="font-black text-stone-950 dark:text-stone-100">{set.reps} x {set.weight_kg || 0}kg</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm font-semibold text-stone-500">No sets logged yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}
