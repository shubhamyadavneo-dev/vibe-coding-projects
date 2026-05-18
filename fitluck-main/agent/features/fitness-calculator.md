````markdown
# RTCF Prompt — Fitness Calculators Module

## R — Role

Act as a senior frontend engineer working on the current project. Your task is to implement a new **Fitness Calculators** module while strictly preserving the existing architecture, styling system, responsiveness, and functionality. Follow the current project patterns, reusable components, theme tokens, spacing, typography, and sidebar behavior.

---

## T — Task

Add a new sidebar navigation route called `Calculators` that opens a new route:

```bash
/calculators
````

Create a responsive calculator dashboard with:

### Left Panel

Calculator selector list:

* BMI Calculator
* BMR Calculator
* TDEE Calculator
* Body Fat Calculator
* Ideal Weight Calculator
* Calorie Needs Calculator

The active calculator should be visually highlighted using the existing design system.

### Right Panel

Dynamic calculator content based on selected calculator type.

Each calculator should include:

* Title
* Short description
* Input form
* Calculate button
* Result card/output section

All calculation logic must be handled entirely on the frontend using reusable utility functions.

Implement these formulas:

### BMI

```ts
BMI = weight / (height * height)
```

Inputs:

* Weight (kg)
* Height (cm)

Show:

* BMI value
* Category:

  * Underweight
  * Normal
  * Overweight
  * Obese

### BMR (Mifflin-St Jeor)

Male:

```ts
BMR = 10 * weight + 6.25 * height - 5 * age + 5
```

Female:

```ts
BMR = 10 * weight + 6.25 * height - 5 * age - 161
```

### TDEE

```ts
TDEE = BMR * activityMultiplier
```

Activity Multipliers:

* Sedentary = 1.2
* Lightly Active = 1.375
* Moderately Active = 1.55
* Very Active = 1.725
* Extra Active = 1.9

Suggested structure:

```bash
components/calculators/
  CalculatorSidebar.tsx
  CalculatorCard.tsx
  CalculatorResult.tsx
  forms/
    BMICalculator.tsx
    BMRCalculator.tsx
    TDEECalculator.tsx

utils/
  fitnessCalculators.ts
```

---

## C — Constraints

* Do NOT break or refactor existing functionality
* Keep changes isolated and minimal
* Match the current project UI/theme exactly
* Reuse existing components/styles where possible
* Fully responsive and mobile friendly
* Use TypeScript best practices
* Prevent invalid/negative inputs
* Add proper validation and error states
* No backend/API integration
* No unnecessary state management libraries
* Keep logic modular and reusable
* Smooth transitions between calculator selections
* Maintain current sidebar/navigation behavior

---

## F — Format

Generate:

1. Required route/page implementation
2. Sidebar navigation integration
3. Reusable calculator components
4. Utility calculation functions
5. Clean responsive UI implementation
6. Type-safe frontend logic
7. Minimal non-breaking changes only

Ensure the final implementation is production-ready, maintainable, and visually consistent with the existing project.

```
```
