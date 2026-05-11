import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import { AppShell } from './layout/AppShell'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CalculatorsPage } from './pages/CalculatorsPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExercisesPage } from './pages/ExercisesPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { PlanPage } from './pages/PlanPage'
import { ProgressPage } from './pages/ProgressPage'
import { ProgressPhotosPage } from './pages/ProgressPhotosPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { WorkoutPage } from './pages/WorkoutPage'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppShell />
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/calculators" element={<CalculatorsPage />} />
        <Route path="/progress-photos" element={<ProgressPhotosPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
