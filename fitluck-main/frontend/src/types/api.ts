export type User = {
  id: number
  name: string
  email: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: User
}

export type ApiError = {
  message?: string
  errors?: Array<{ field: string; message: string }>
}

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'QUADS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'CALVES'
  | 'ABS'
  | 'CARDIO'

export type Exercise = {
  id: number
  name: string
  description?: string
  instructions?: string
  image_url?: string
  video_url?: string
  muscle?: {
    id: number
    name: string
    group: MuscleGroup
  }
}

export type PlanDayExercise = {
  id: number
  recommended_sets: number
  recommended_reps: number
  order: number
  exercise: Exercise
}

export type WorkoutSet = {
  id: number
  exercise_id: number
  set_number: number
  reps: number
  weight_kg?: number
  exercise?: Exercise
}

export type WorkoutLog = {
  id: number
  completed: boolean
  duration_minutes?: number
  notes?: string
  logged_at: string
  sets?: WorkoutSet[]
}

export type PlanDay = {
  id: number
  day_number: number
  scheduled_date: string
  day_of_week: string
  workout_type: string
  label?: string
  exercises?: PlanDayExercise[]
  workoutLog?: WorkoutLog | null
}

export type UserPlan = {
  id: number
  goal: string
  timeframe: string
  routine_type: string
  start_date: string
  end_date: string
  planDays?: PlanDay[]
}

export type WeightEntry = {
  id: number
  weight_kg: number
  logged_at: string
}

export type MeasurementEntry = {
  id: number
  chest_cm?: number
  waist_cm?: number
  arms_cm?: number
  thighs_cm?: number
  calves_cm?: number
  shoulders_cm?: number
  logged_at: string
}

export type PersonalRecord = {
  id: number
  exercise_id: number
  weight_kg: number
  reps: number
  achieved_at: string
  exercise?: Exercise
}

export type Stats = {
  totalWorkouts: number
  totalLogs: number
  totalSets: number
  totalExercises: number
  totalVolume: number
}

export type Consistency = {
  totalPlanDays: number
  completedDays: number
  completionRate: number
  currentStreak: number
  bestStreak: number
}

export type StrengthPoint = {
  date: string
  exercise_id: number
  exercise_name: string
  weight_kg?: number
  reps: number
}

export type CalendarDay = {
  id: number
  date: string
  day_of_week: string
  label?: string
  completed: boolean
  log_id: number | null
}
