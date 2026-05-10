import { Form, Formik } from 'formik'
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { FieldError } from '../components/Ui'

const resetPasswordSchema = Yup.object({
  password: Yup.string().min(6, 'Use at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
})

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()

  if (!token) {
    return (
      <main className="min-h-screen bg-stone-950 text-white">
        <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative flex min-h-[42vh] items-end overflow-hidden p-6 md:p-10 lg:min-h-screen">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-stone-950/55" />
            <div className="relative max-w-2xl pb-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-red-400 text-stone-950 dark:text-stone-100">
                  <Lock className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-2xl font-black">Fitluck</p>
                  <p className="text-sm font-semibold text-red-200">Invalid reset link</p>
                </div>
              </div>
              <h1 className="max-w-xl text-4xl font-black leading-tight md:text-6xl">Missing reset token.</h1>
              <p className="mt-4 text-stone-300">
                The reset link you used appears to be incomplete. Please request a new password reset.
              </p>
              <Link
                to="/forgot-password"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-800 px-5 py-3 font-bold text-white hover:bg-stone-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to forgot password
              </Link>
            </div>
          </section>
          <section className="flex items-center justify-center bg-stone-100 px-4 py-8 text-stone-950 dark:text-stone-100 md:px-8">
            <div className="w-full max-w-md text-center">
              <div className="fit-card p-5 md:p-6">
                <h2 className="mb-2 text-2xl font-black">Invalid token</h2>
                <p className="text-stone-600">Please check your email for the correct reset link.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex min-h-[42vh] items-end overflow-hidden p-6 md:p-10 lg:min-h-screen">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-stone-950/55" />
          <div className="relative max-w-2xl pb-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-lime-400 text-stone-950 dark:text-stone-100">
                <Lock className="h-7 w-7" />
              </div>
              <div>
                <p className="text-2xl font-black">Fitluck</p>
                <p className="text-sm font-semibold text-lime-200">Set a new password</p>
              </div>
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-6xl">Choose a strong new password.</h1>
            <p className="mt-4 text-stone-300">
              Your password should be at least 6 characters long.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-stone-100 px-4 py-8 text-stone-950 dark:bg-stone-950 dark:text-stone-100 md:px-8">
          <div className="w-full max-w-md">
            <div className="fit-card p-5 md:p-6">
              <Link
                to="/login"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>

              <h2 className="mb-2 text-2xl font-black">Reset password</h2>
              <p className="mb-6 text-stone-600">
                Enter your new password below.
              </p>

              {notice && <div className="mb-4 rounded-lg border border-lime-200 bg-lime-50 px-3 py-2 text-sm font-semibold text-lime-800">{notice}</div>}
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

              {success ? (
                <div className="rounded-lg border border-stone-200 bg-white p-5 text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-lime-100 text-lime-700">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Password updated!</h3>
                  <p className="text-stone-600">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                  <Link
                    to="/login"
                    className="mt-6 inline-block w-full rounded-lg bg-stone-800 px-4 py-3 text-center font-bold text-white hover:bg-stone-900"
                  >
                    Go to login
                  </Link>
                </div>
              ) : (
                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={resetPasswordSchema}
                  onSubmit={async (values, helpers) => {
                    setError('')
                    setNotice('')
                    try {
                      const message = await resetPassword(token, values.password)
                      setNotice(message)
                      setSuccess(true)
                    } catch (err) {
                      setError(getErrorMessage(err))
                    } finally {
                      helpers.setSubmitting(false)
                    }
                  }}
                >
                  {({ values, errors, touched, handleChange, isSubmitting }) => (
                    <Form className="space-y-4">
                      {/* New password */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-stone-400 shrink-0" />
                          <label className="fit-label">New password</label>
                        </div>

                        <div className="mt-1">
                          <input
                            name="password"
                            type="password"
                            value={values.password}
                            onChange={handleChange}
                            className="fit-input"
                            placeholder="At least 6 characters"
                          />
                        </div>

                        <FieldError message={touched.password ? errors.password : undefined} />
                      </div>

                      {/* Confirm password */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-stone-400 shrink-0" />
                          <label className="fit-label">Confirm new password</label>
                        </div>

                        <div className="mt-1">
                          <input
                            name="confirmPassword"
                            type="password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            className="fit-input"
                            placeholder="Repeat your password"
                          />
                        </div>

                        <FieldError
                          message={touched.confirmPassword ? errors.confirmPassword : undefined}
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="fit-button w-full flex items-center justify-center gap-2"
                      >
                        Reset password
                        <CheckCircle className="h-4 w-4" />
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