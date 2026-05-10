import { Form, Formik } from 'formik'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { FieldError } from '../components/Ui'

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Use a valid email').required('Email is required'),
})

export function ForgotPasswordPage() {
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { forgotPassword } = useAuth()

  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex min-h-[42vh] items-end overflow-hidden p-6 md:p-10 lg:min-h-screen">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-stone-950/55" />
          <div className="relative max-w-2xl pb-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-lime-400 text-stone-950 dark:text-stone-100">
                <Send className="h-7 w-7" />
              </div>
              <div>
                <p className="text-2xl font-black">Fitluck</p>
                <p className="text-sm font-semibold text-lime-200">Reset your password</p>
              </div>
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-6xl">Get back to your fitness journey.</h1>
            <p className="mt-4 text-stone-300">
              Enter your email and we'll send you a link to reset your password.
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

              <h2 className="mb-2 text-2xl font-black">Forgot password?</h2>
              <p className="mb-6 text-stone-600">
                No worries. We'll email you a reset link.
              </p>

              {notice && <div className="mb-4 rounded-lg border border-lime-200 bg-lime-50 px-3 py-2 text-sm font-semibold text-lime-800">{notice}</div>}
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

              {submitted ? (
                <div className="rounded-lg border border-stone-200 bg-white p-5 text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-lime-100 text-lime-700">
                    <Send className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Check your inbox</h3>
                  <p className="text-stone-600">
                    If an account exists with that email, you'll receive a password reset link shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setNotice('')
                      setError('')
                    }}
                    className="mt-6 w-full rounded-lg bg-stone-800 px-4 py-3 font-bold text-white hover:bg-stone-900"
                  >
                    Send another link
                  </button>
                </div>
              ) : (
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={forgotPasswordSchema}
                  onSubmit={async (values, helpers) => {
                    setError('')
                    setNotice('')
                    try {
                      const message = await forgotPassword(values.email)
                      setNotice(message)
                      setSubmitted(true)
                    } catch (err) {
                      setError(getErrorMessage(err))
                    } finally {
                      helpers.setSubmitting(false)
                    }
                  }}
                >
                  {({ values, errors, touched, handleChange, isSubmitting }) => (
                    <Form className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-stone-400 shrink-0" />
                          <label className="fit-label">Email</label>
                        </div>

                        <div className="mt-1">
                          <input
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            className="fit-input"
                          />
                        </div>

                        <FieldError message={touched.email ? errors.email : undefined} />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="fit-button w-full flex items-center justify-center gap-2"
                      >
                        Send reset link
                        <Send className="h-4 w-4" />
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