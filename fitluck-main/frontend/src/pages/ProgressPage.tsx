import { Form, Formik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import * as Yup from 'yup'
import { api, getErrorMessage } from '../api/client'
import { WeightChart } from '../components/Charts'
import { EmptyState, FieldError, LoadingBlock, PageTitle } from '../components/Ui'
import type { MeasurementEntry, PersonalRecord, WeightEntry } from '../types/api'

const weightSchema = Yup.object({
  weight_kg: Yup.number().positive('Must be positive').required('Weight is required'),
})

const measurementSchema = Yup.object({
  chest_cm: Yup.number().positive().nullable(),
  waist_cm: Yup.number().positive().nullable(),
  arms_cm: Yup.number().positive().nullable(),
  thighs_cm: Yup.number().positive().nullable(),
  calves_cm: Yup.number().positive().nullable(),
  shoulders_cm: Yup.number().positive().nullable(),
})

export function ProgressPage() {
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([])
  const [records, setRecords] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [weightRes, measurementRes, recordRes] = await Promise.all([
        api.get<WeightEntry[]>('/progress/weight'),
        api.get<MeasurementEntry[]>('/progress/measurements'),
        api.get<PersonalRecord[]>('/progress/records'),
      ])
      setWeights(weightRes.data)
      setMeasurements(measurementRes.data)
      setRecords(recordRes.data)
    } catch (err) {
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

  const weightLabels = useMemo(() => weights.slice(-10).map((item) => new Date(item.logged_at).toLocaleDateString()), [weights])
  const weightValues = useMemo(() => weights.slice(-10).map((item) => item.weight_kg), [weights])

  if (loading) return <LoadingBlock />

  return (
    <div className="space-y-6">
      <PageTitle kicker="Progress" title="Track what moves" />
      {message && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div>}

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Log weight</h2>
          <Formik
            initialValues={{ weight_kg: '', logged_at: '' }}
            validationSchema={weightSchema}
            onSubmit={async (values, helpers) => {
              try {
                await api.post('/progress/weight', {
                  weight_kg: Number(values.weight_kg),
                  logged_at: values.logged_at || undefined,
                })
                helpers.resetForm()
                await load()
              } catch (err) {
                setMessage(getErrorMessage(err))
              } finally {
                helpers.setSubmitting(false)
              }
            }}
          >
            {({ values, errors, touched, handleChange, isSubmitting }) => (
              <Form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="fit-label">Weight kg</label>
                  <input name="weight_kg" type="number" value={values.weight_kg} onChange={handleChange} className="fit-input mt-1" />
                  <FieldError message={touched.weight_kg ? errors.weight_kg : undefined} />
                </div>
                <div>
                  <label className="fit-label">Date</label>
                  <input name="logged_at" type="date" value={values.logged_at} onChange={handleChange} className="fit-input mt-1" />
                </div>
                <button type="submit" disabled={isSubmitting} className="fit-button self-end">Save</button>
              </Form>
            )}
          </Formik>
        </section>

        <section className="fit-card p-5">
          <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Weight chart</h2>
          <div className="h-64">
            {weights.length ? <WeightChart labels={weightLabels} values={weightValues} /> : <EmptyState title="No entries" detail="Add weight to start the chart." />}
          </div>
        </section>
      </div>

      <section className="fit-card p-5">
        <h2 className="mb-4 text-lg font-black text-stone-950 dark:text-stone-100">Log measurements</h2>
        <Formik
          initialValues={{ chest_cm: '', waist_cm: '', arms_cm: '', thighs_cm: '', calves_cm: '', shoulders_cm: '', logged_at: '' }}
          validationSchema={measurementSchema}
          onSubmit={async (values, helpers) => {
            try {
              const numericEntries = Object.fromEntries(
                Object.entries(values).map(([key, value]) => [key, value && key !== 'logged_at' ? Number(value) : value || undefined]),
              )
              await api.post('/progress/measurements', numericEntries)
              helpers.resetForm()
              await load()
            } catch (err) {
              setMessage(getErrorMessage(err))
            } finally {
              helpers.setSubmitting(false)
            }
          }}
        >
          {({ values, handleChange, isSubmitting }) => (
            <Form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {['chest_cm', 'waist_cm', 'arms_cm', 'thighs_cm', 'calves_cm', 'shoulders_cm'].map((field) => (
                <div key={field}>
                  <label className="fit-label">{field.replace('_cm', '').replace('_', ' ')}</label>
                  <input name={field} type="number" value={values[field as keyof typeof values]} onChange={handleChange} className="fit-input mt-1" />
                </div>
              ))}
              <div>
                <label className="fit-label">Date</label>
                <input name="logged_at" type="date" value={values.logged_at} onChange={handleChange} className="fit-input mt-1" />
              </div>
              <button type="submit" disabled={isSubmitting} className="fit-button self-end">Save</button>
            </Form>
          )}
        </Formik>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="fit-card overflow-hidden">
          <div className="border-b border-stone-200 p-4">
            <h2 className="text-lg font-black text-stone-950 dark:text-stone-100">Measurements</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {measurements.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="grid grid-cols-2 gap-2 p-4 text-sm sm:grid-cols-4">
                <p className="font-bold text-stone-950 dark:text-stone-100">{new Date(entry.logged_at).toLocaleDateString()}</p>
                <p>Waist {entry.waist_cm || '-'}cm</p>
                <p>Chest {entry.chest_cm || '-'}cm</p>
                <p>Arms {entry.arms_cm || '-'}cm</p>
              </div>
            ))}
            {!measurements.length && <div className="p-4 text-sm font-semibold text-stone-500">No measurements yet.</div>}
          </div>
        </section>

        <section className="fit-card overflow-hidden">
          <div className="border-b border-stone-200 p-4">
            <h2 className="text-lg font-black text-stone-950 dark:text-stone-100">Personal records</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {records.slice(0, 8).map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold text-stone-950 dark:text-stone-100">{record.exercise?.name || `Exercise ${record.exercise_id}`}</p>
                  <p className="text-sm text-stone-500">{new Date(record.achieved_at).toLocaleDateString()}</p>
                </div>
                <p className="text-lg font-black text-stone-950 dark:text-stone-100">{record.weight_kg}kg x {record.reps}</p>
              </div>
            ))}
            {!records.length && <div className="p-4 text-sm font-semibold text-stone-500">No records yet.</div>}
          </div>
        </section>
      </div>
    </div>
  )
}
