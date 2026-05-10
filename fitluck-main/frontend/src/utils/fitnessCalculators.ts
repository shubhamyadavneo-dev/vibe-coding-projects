/**
 * Fitness Calculator Utilities
 * All calculations are performed client-side with no backend dependencies
 */

// BMI Calculation
export interface BMIResult {
  bmi: number
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese'
  description: string
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)

  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese'
  let description: string

  if (bmi < 18.5) {
    category = 'Underweight'
    description = 'You are below a healthy weight range. Consider consulting a nutritionist.'
  } else if (bmi < 25) {
    category = 'Normal'
    description = 'You are at a healthy weight. Maintain your current lifestyle!'
  } else if (bmi < 30) {
    category = 'Overweight'
    description = 'You are above a healthy weight range. Focus on nutrition and exercise.'
  } else {
    category = 'Obese'
    description = 'You are significantly above a healthy weight range. Consult a healthcare provider.'
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    description,
  }
}

// BMR Calculation (Mifflin-St Jeor Formula)
export interface BMRResult {
  bmr: number
  description: string
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: 'male' | 'female'
): BMRResult {
  let bmr: number

  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161
  }

  const roundedBMR = Math.round(bmr)

  return {
    bmr: roundedBMR,
    description: `Your body burns approximately ${roundedBMR} calories at rest per day.`,
  }
}

// TDEE Calculation
export interface TDEEResult {
  bmr: number
  tdee: number
  multiplier: number
  description: string
}

export const activityMultipliers = {
  sedentary: { label: 'Sedentary (little to no exercise)', value: 1.2 },
  lightly_active: { label: 'Lightly Active (1-3 days/week)', value: 1.375 },
  moderately_active: { label: 'Moderately Active (3-5 days/week)', value: 1.55 },
  very_active: { label: 'Very Active (6-7 days/week)', value: 1.725 },
  extra_active: { label: 'Extra Active (2x per day)', value: 1.9 },
}

export function calculateTDEE(
  bmr: number,
  activityLevel: keyof typeof activityMultipliers
): TDEEResult {
  const multiplier = activityMultipliers[activityLevel].value
  const tdee = Math.round(bmr * multiplier)

  return {
    bmr,
    tdee,
    multiplier,
    description: `With your ${activityMultipliers[activityLevel].label.toLowerCase()}, you need approximately ${tdee} calories per day to maintain your weight.`,
  }
}

// Body Fat Percentage (US Navy Formula - Abdomen method for men, Jackson-Pollock for women)
export interface BodyFatResult {
  bodyFatPercentage: number
  category: string
  description: string
}

export function calculateBodyFat(
  gender: 'male' | 'female',
  heightCm: number,
  neckCm: number,
  abdomenCm: number | null,
  hipsCm: number | null
): BodyFatResult {
  let bodyFatPercentage: number

  if (gender === 'male' && abdomenCm !== null) {
    // US Navy Formula for men
    bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(abdomenCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
  } else if (gender === 'female' && hipsCm !== null && abdomenCm !== null) {
    // Jackson-Pollock Formula for women
    bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(abdomenCm + hipsCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450
  } else {
    throw new Error('Invalid measurements for body fat calculation')
  }

  bodyFatPercentage = Math.max(0, Math.min(60, bodyFatPercentage)) // Clamp between 0-60%

  let category: string
  let description: string

  if (gender === 'male') {
    if (bodyFatPercentage < 10) {
      category = 'Essential Fat'
      description = 'Very lean, typically only achieved by athletes during competition.'
    } else if (bodyFatPercentage < 14) {
      category = 'Athletes'
      description = 'Very fit and athletic physique.'
    } else if (bodyFatPercentage < 18) {
      category = 'Fitness'
      description = 'Fit and healthy range.'
    } else if (bodyFatPercentage < 25) {
      category = 'Average'
      description = 'Normal and healthy body fat range.'
    } else {
      category = 'Obese'
      description = 'Consider lifestyle changes for better health.'
    }
  } else {
    if (bodyFatPercentage < 14) {
      category = 'Essential Fat'
      description = 'Very lean, typically only achieved by athletes during competition.'
    } else if (bodyFatPercentage < 21) {
      category = 'Athletes'
      description = 'Very fit and athletic physique.'
    } else if (bodyFatPercentage < 25) {
      category = 'Fitness'
      description = 'Fit and healthy range.'
    } else if (bodyFatPercentage < 32) {
      category = 'Average'
      description = 'Normal and healthy body fat range.'
    } else {
      category = 'Obese'
      description = 'Consider lifestyle changes for better health.'
    }
  }

  return {
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
    category,
    description,
  }
}

// Ideal Weight Calculation (Devine Formula)
export interface IdealWeightResult {
  maleLowerBound: number
  maleUpperBound: number
  femaleLowerBound: number
  femaleUpperBound: number
  description: string
}

export function calculateIdealWeight(heightCm: number): IdealWeightResult {
  const heightInches = heightCm / 2.54

  // Devine Formula
  const maleBase = 50 + 2.3 * (heightInches - 60)
  const femaleBase = 45.5 + 2.3 * (heightInches - 60)

  // ±10% range for healthy weight
  const maleLowerBound = Math.round(maleBase * 0.9)
  const maleUpperBound = Math.round(maleBase * 1.1)
  const femaleLowerBound = Math.round(femaleBase * 0.9)
  const femaleUpperBound = Math.round(femaleBase * 1.1)

  return {
    maleLowerBound,
    maleUpperBound,
    femaleLowerBound,
    femaleUpperBound,
    description: 'These ranges are based on the Devine Formula and represent healthy weight guidelines. Individual variation is normal.',
  }
}

// Calorie Needs for Goal
export interface CalorieNeedsResult {
  maintenance: number
  weightLoss: number
  weightGain: number
  aggressiveWeightLoss: number
}

export function calculateCalorieNeeds(tdee: number): CalorieNeedsResult {
  return {
    maintenance: tdee,
    weightLoss: Math.round(tdee - 500), // 500 cal deficit = ~0.5kg/week loss
    weightGain: Math.round(tdee + 500), // 500 cal surplus = ~0.5kg/week gain
    aggressiveWeightLoss: Math.round(tdee - 1000), // 1000 cal deficit = ~1kg/week loss
  }
}

// Input Validation
export function validatePositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0
}

export function validateAge(age: string | number): boolean {
  const num = typeof age === 'string' ? parseInt(age, 10) : age
  return !isNaN(num) && num >= 10 && num <= 120
}

export function validateHeight(height: string | number): boolean {
  const num = typeof height === 'string' ? parseFloat(height) : height
  return !isNaN(num) && num >= 50 && num <= 300 // 50cm - 300cm
}

export function validateWeight(weight: string | number): boolean {
  const num = typeof weight === 'string' ? parseFloat(weight) : weight
  return !isNaN(num) && num >= 10 && num <= 500 // 10kg - 500kg
}
