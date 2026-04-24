import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthForm = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegisterMode) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-primary-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          {isRegisterMode ? 'Create account' : 'Sign in'}
        </h1>
        <p className="mb-6 text-sm text-slate-600">Jira-style workspace access with secure authentication.</p>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div>
              <label className="label" htmlFor="auth-name">Full name</label>
              <input id="auth-name" className="input" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          <div>
            <label className="label" htmlFor="auth-email">Email</label>
            <input id="auth-email" className="input" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="label" htmlFor="auth-password">Password</label>
            <input id="auth-password" className="input" type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>
          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? 'Please wait...' : isRegisterMode ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          className="mt-4 w-full text-center text-sm text-primary-700 hover:text-primary-800"
          onClick={() => setIsRegisterMode((prev) => !prev)}
          type="button"
        >
          {isRegisterMode ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
