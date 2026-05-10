import { Form, Formik } from 'formik'
import { Activity, ArrowRight, Lock, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { FieldError } from '../components/Ui'

const loginSchema = Yup.object({
  email: Yup.string().email('Use a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

const registerSchema = Yup.object({
  name: Yup.string().min(2, 'Name is too short').required('Name is required'),
  email: Yup.string().email('Use a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Use at least 6 characters').required('Password is required'),
})

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const { login, register } = useAuth()

  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex min-h-[42vh] items-end overflow-hidden p-6 md:p-10 lg:min-h-screen">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-stone-950/55" />
          <div className="relative max-w-2xl pb-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-lime-400 text-stone-950 dark:text-stone-100">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <p className="text-2xl font-black">Fitluck</p>
                <p className="text-sm font-semibold text-lime-200">Workout rhythm, logged cleanly.</p>
              </div>
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-6xl">Carry your training plan from warm-up to progress chart.</h1>
          </div>
        </section>

        <section className="flex items-center justify-center bg-stone-100 px-4 py-8 text-stone-950 dark:bg-stone-950 dark:text-stone-100 md:px-8">
          <div className="w-full max-w-md">
            <div className="fit-card p-5 md:p-6">
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
                <button type="button" onClick={() => setMode('login')} className={`rounded-md px-3 py-2 text-sm font-bold ${mode === 'login' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>
                  Login
                </button>
                <button type="button" onClick={() => setMode('register')} className={`rounded-md px-3 py-2 text-sm font-bold ${mode === 'register' ? 'bg-white shadow-sm' : 'text-stone-500'}`}>
                  Register
                </button>
              </div>

              {notice && <div className="mb-4 rounded-lg border border-lime-200 bg-lime-50 px-3 py-2 text-sm font-semibold text-lime-800">{notice}</div>}
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

              {mode === 'login' ? (
                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={loginSchema}
                  onSubmit={async (values, helpers) => {
                    setError('')
                    setNotice('')
                    try {
                      await login(values.email, values.password)
                    } catch (err) {
                      setError(getErrorMessage(err))
                    } finally {
                      helpers.setSubmitting(false)
                    }
                  }}
                >
                  {({ values, errors, touched, handleChange, isSubmitting }) => (
                    <Form className="space-y-4">
  {/* Email */}
  <div>
    <div className="flex items-center gap-2">
      <Mail className="h-4 w-4 text-stone-400 shrink-0" />
      <label className="fit-label">Email</label>
    </div>

    <div className="mt-1">
      <input
        name="email"
        value={values.email ?? ''}
        onChange={handleChange}
        className="fit-input"
        placeholder="start@fitluck.com"
      />
    </div>

    <FieldError message={touched.email ? errors.email : undefined} />
  </div>

  {/* Password */}
  <div>
    <div className="flex items-center gap-2">
      <Lock className="h-4 w-4 text-stone-400 shrink-0" />
      <label className="fit-label">Password</label>
    </div>

    <div className="mt-1">
      <input
        name="password"
        type="password"
        value={values.password ?? ''}
        onChange={handleChange}
        className="fit-input"
        placeholder="••••••••"
      />
    </div>

    <FieldError message={touched.password ? errors.password : undefined} />
  </div>

  {/* Forgot password */}
  <div className="mb-2 flex justify-end">
    <Link
      to="/forgot-password"
      className="text-sm font-semibold text-stone-500 hover:text-stone-800"
    >
      Forgot password?
    </Link>
  </div>

  {/* Submit */}
  <button
    type="submit"
    disabled={isSubmitting}
    className="fit-button w-full flex items-center justify-center gap-2"
  >
    Enter Fitluck
    <ArrowRight className="h-4 w-4" />
  </button>
</Form>
                  )}
                </Formik>
              ) : (
                <Formik
                  initialValues={{ name: '', email: '', password: '' }}
                  validationSchema={registerSchema}
                  onSubmit={async (values, helpers) => {
                    setError('')
                    setNotice('')
                    try {
                      console.log('Register clicked', values);
                      
                      const message = await register(values)
                      setNotice(message)
                      setMode('login')
                    } catch (err) {
                      setError(getErrorMessage(err))
                    } finally {
                      helpers.setSubmitting(false)
                    }
                  }}
                >
                  {({ values, errors, touched, handleChange, isSubmitting }) => (
                    <Form className="space-y-4">
                      {/* Name */}
                      <div>
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-stone-400" />
                          <label className="fit-label">Name</label>
                        </div>

                        <div className="mt-1">
                          <input
                            name="name"
                            value={values.name ?? ''}
                            onChange={handleChange}
                            className="fit-input"
                            placeholder="John Doe"
                          />
                        </div>

                        <FieldError message={touched.name ? errors.name : undefined} />
                      </div>

                      {/* Email */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-stone-400" />
                          <label className="fit-label">Email</label>
                        </div>

                        <div className="mt-1">
                          <input
                            name="email"
                            value={values.email ?? ''}
                            onChange={handleChange}
                            className="fit-input"
                          />
                        </div>

                        <FieldError message={touched.email ? errors.email : undefined} />
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-stone-400" />
                          <label className="fit-label">Password</label>
                        </div>

                        <div className="mt-1">
                          <input
                            name="password"
                            type="password"
                            value={values.password ?? ''}
                            onChange={handleChange}
                            className="fit-input"
                            placeholder="At least 6 characters"
                          />
                        </div>

                        <FieldError message={touched.password ? errors.password : undefined} />
                      </div>

                      <button type="submit" disabled={isSubmitting} className="fit-button w-full">
                        Create account
                      </button>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
