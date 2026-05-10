require('dotenv').config()
const prisma = require('./client')

const muscleGroups = [
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
  'QUADS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES',
  'ABS',
  'CARDIO'
]

const chestExerciseImages = {
  'Bench Press': '/chest/bench_press.png',
  'Incline Dumbbell Press': '/chest/incline_dumbell_press.png',
  'Push Up': '/chest/push_ups.png',
  'Chest Fly': '/chest/chest_fly.png',
  'Cable Crossover': '/chest/cable_crossover.png',
  'Dips': '/chest/dips.png',
  'Decline Press': '/chest/decline_press.png',
  'Machine Chest Press': '/chest/machine_chest_press.png',
  'Pec Deck Fly': '/chest/pec_deck_fly.png',
  'Close Grip Push Up': '/chest/close_grip_pushups.png'
}

const backExerciseImages = {
  'Pull Up': '/back/pull_up.png',
  'Lat Pulldown': '/back/lut_pulldown.png',
  'Barbell Row': '/back/barbell_row.png',
  'Seated Cable Row': '/back/seated_cable_row.png',
  'Single Arm Dumbbell Row': '/back/single_arm.png',
  'Deadlift': '/back/deadlift.png',
  'T Bar Row': '/back/t_bar_row.png',
  'Face Pull': '/back/face_pull.png',
  'Straight Arm Pulldown': '/back/straight_arm_pulldown.png',
  'Back Extension': '/back/back_extension.png'
}

const bicepsExerciseImages = {
  'Barbell Curl': '/biceps/barbell_curl.png',
  'Dumbbell Curl': '/biceps/dumbbell_curl.png',
  'Hammer Curl': '/biceps/hammer_curl.png',
  'Preacher Curl': '/biceps/preacher_curl.png',
  'Cable Curl': '/biceps/cable_curl.png',
  'Concentration Curl': '/biceps/concentration_curl.png',
  'Incline Dumbbell Curl': '/biceps/incline_dumbbell_curl.png',
  'EZ Bar Curl': '/biceps/ez_bar_curl.png',
  'Reverse Curl': '/biceps/reverse_curl.png',
  'Spider Curl': '/biceps/spider_curl.png'
}

const shouldersExerciseImages = {
  'Overhead Press': '/shoulders/overhead_press.png',
  'Dumbbell Shoulder Press': '/shoulders/dumbell_shoulder_press.png',
  'Lateral Raise': '/shoulders/lateral_raise.png',
  'Front Raise': '/shoulders/front_raise.png',
  'Rear Delt Fly': '/shoulders/rear_delt_fly.png',
  'Arnold Press': '/shoulders/arnold_press.png',
  'Upright Row': '/shoulders/upright_row.png',
  'Cable Lateral Raise': '/shoulders/cable_lateral_raise.png',
  'Machine Shoulder Press': '/shoulders/machine_shoulder_press.png',
  'Shrug': '/shoulders/shrug.png'
}

const absExerciseImages = {
  'Plank': '/abs/plank.png',
  'Crunch': '/abs/crunch.png',
  'Hanging Leg Raise': '/abs/hanging_leg_raise.png',
  'Russian Twist': '/abs/russian_twist.png',
  'Cable Crunch': '/abs/cable_crunch.png',
  'Ab Wheel Rollout': '/abs/ab_wheel_rollout.png',
  'Mountain Climber': '/abs/mountain_climber.png',
  'Dead Bug': '/abs/dead_bag.png',
  'Bicycle Crunch': '/abs/bicycle_crunch.png',
  'Reverse Crunch': '/abs/reverse_crunch.png'
}

const quadsExerciseImages = {
  'Back Squat': '/quads/back_squat.png',
  'Front Squat': '/quads/front_squat.png',
  'Leg Press': '/quads/leg_press.png',
  'Walking Lunge': '/quads/walking_lunge.png',
  'Bulgarian Split Squat': '/quads/bulgarian_split_squat.png',
  'Leg Extension': '/quads/leg_extension.png',
  'Goblet Squat': '/quads/goblet_squat.png',
  'Step Up': '/quads/step_up.png',
  'Hack Squat': '/quads/hack_squat.png',
  'Wall Sit': '/quads/wall_sit.png'
}

const calvesExerciseImages = {
  'Standing Calf Raise': '/calves/standing_calf_raise.png',
  'Seated Calf Raise': '/calves/seated_calf_raise.png',
  'Donkey Calf Raise': '/calves/donkey_calf_raise.png',
  'Leg Press Calf Raise': '/calves/leg_press_calf_raise.png',
  'Single Leg Calf Raise': '/calves/single_leg_calf_raise.png',
  'Jump Rope': '/calves/jump_rope.png',
  'Box Jump': '/calves/box_jump.png',
  'Farmer Walk Calf Raise': '/calves/farmer_walk_calf_raise.png',
  'Smith Machine Calf Raise': '/calves/smith_machine_calf_raise.png',
  'Tibialis Raise': '/calves/tibialis_raise.png'
}

const glutesExerciseImages = {
  'Hip Thrust': '/glutes/hip_thrust.png',
  'Glute Bridge': '/glutes/glute_bridge.png',
  'Cable Kickback': '/glutes/cable_kickpack.png',
  'Sumo Deadlift': '/glutes/sumo_deadlift.png',
  'Curtsy Lunge': '/glutes/curtsy_lunge.png',
  'Frog Pump': '/glutes/frog_jump.png',
  'Step Up Glute Focus': '/glutes/step_up_glute_focus.png',
  'Bulgarian Split Squat Glute': '/glutes/bulgarian_split_squat_glute.png',
  'Banded Lateral Walk': '/glutes/banded_lateral_walk.png',
  'Single Leg Hip Thrust': '/glutes/single_leg_hip_thrust.png'
}

const cardioExerciseImages = {
  'Treadmill Run': '/cardio/trademill_run.png',
  'Stationary Bike': '/cardio/stationary_bike.png',
  'Rowing Machine': '/cardio/rowing_machine.png',
  'Elliptical': '/cardio/elliptical.png',
  'Jump Rope Intervals': '/cardio/jump_rope_intervals.png',
  'Burpee': '/cardio/burpee.png',
  'High Knees': '/cardio/high_knees.png',
  'Battle Rope': '/cardio/battle_rope.png',
  'Stair Climber': '/cardio/stair_climber.png',
  'Sprint Interval': '/cardio/sprint_interval.png'
}

const tricepsExerciseImages = {
  'Triceps Pushdown': '/triceps/triceps_pushdown.png',
  'Skull Crusher': '/triceps/skull_crusher.png',
  'Close Grip Bench Press': '/triceps/close_grip_bench_press.png',
  'Overhead Triceps Extension': '/triceps/overhead_triceps_extension.png',
  'Bench Dip': '/triceps/bench_dip.png',
  'Rope Pushdown': '/triceps/rope_push_down.png',
  'Diamond Push Up': '/triceps/diamond_push_up.png',
  'Cable Kickback': '',
  'Machine Dip': '/triceps/machine_dip.png',
  'Single Arm Extension': '/triceps/single_arm_extension.png'
}

const forearmsExerciseImages = {
  'Wrist Curl': '/forearms/wrist_curl.png',
  'Reverse Wrist Curl': '/forearms/reverse_wrist_curl.png',
  'Farmer Carry': '/forearms/farmer_carry.png',
  'Plate Pinch': '/forearms/plate_pinch.png',
  'Reverse Barbell Curl': '/forearms/reverse_barbell_curl.png',
  'Dead Hang': '/forearms/dead_hang.png',
  'Wrist Roller': '/forearms/wrist_roller.png',
  'Grip Squeeze': '/forearms/grip_squeeze.png',
  'Towel Pull Up': '/forearms/towel_pull_up.png',
  'Zottman Curl': '/forearms/zottman_curl.png'
}

const exerciseImagesByGroup = {
  CHEST: chestExerciseImages,
  BACK: backExerciseImages,
  BICEPS: bicepsExerciseImages,
  SHOULDERS: shouldersExerciseImages,
  ABS: absExerciseImages,
  QUADS: quadsExerciseImages,
  CALVES: calvesExerciseImages,
  GLUTES: glutesExerciseImages,
  CARDIO: cardioExerciseImages,
  TRICEPS: tricepsExerciseImages,
  FOREARMS: forearmsExerciseImages
}

const goals = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'STAY_HEALTHY']
const routineTypes = ['ALTERNATE', 'DAILY', 'WEEKEND']
const workoutTypes = ['UNI', 'DOUBLE', 'FULL_BODY']
const dayOfWeekByRoutine = {
  ALTERNATE: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
  DAILY: ['MONDAY', 'TUESDAY', 'WEDNESDAY'],
  WEEKEND: ['SATURDAY', 'SUNDAY', 'SATURDAY']
}

const exercisesByGroup = {
  CHEST: ['Bench Press', 'Incline Dumbbell Press', 'Push Up', 'Chest Fly', 'Cable Crossover', 'Dips', 'Decline Press', 'Machine Chest Press', 'Pec Deck Fly', 'Close Grip Push Up'],
  BACK: ['Pull Up', 'Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'Single Arm Dumbbell Row', 'Deadlift', 'T Bar Row', 'Face Pull', 'Straight Arm Pulldown', 'Back Extension'],
  SHOULDERS: ['Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Upright Row', 'Cable Lateral Raise', 'Machine Shoulder Press', 'Shrug'],
  BICEPS: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl', 'Concentration Curl', 'Incline Dumbbell Curl', 'EZ Bar Curl', 'Reverse Curl', 'Spider Curl'],
  TRICEPS: ['Triceps Pushdown', 'Skull Crusher', 'Close Grip Bench Press', 'Overhead Triceps Extension', 'Bench Dip', 'Rope Pushdown', 'Diamond Push Up', 'Cable Kickback', 'Machine Dip', 'Single Arm Extension'],
  FOREARMS: ['Wrist Curl', 'Reverse Wrist Curl', 'Farmer Carry', 'Plate Pinch', 'Reverse Barbell Curl', 'Dead Hang', 'Wrist Roller', 'Grip Squeeze', 'Towel Pull Up', 'Zottman Curl'],
  QUADS: ['Back Squat', 'Front Squat', 'Leg Press', 'Walking Lunge', 'Bulgarian Split Squat', 'Leg Extension', 'Goblet Squat', 'Step Up', 'Hack Squat', 'Wall Sit'],
  HAMSTRINGS: ['Romanian Deadlift', 'Lying Leg Curl', 'Seated Leg Curl', 'Good Morning', 'Single Leg Deadlift', 'Glute Ham Raise', 'Nordic Curl', 'Kettlebell Swing', 'Cable Pull Through', 'Stability Ball Curl'],
  GLUTES: ['Hip Thrust', 'Glute Bridge', 'Cable Kickback', 'Sumo Deadlift', 'Curtsy Lunge', 'Frog Pump', 'Step Up Glute Focus', 'Bulgarian Split Squat Glute', 'Banded Lateral Walk', 'Single Leg Hip Thrust'],
  CALVES: ['Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise', 'Leg Press Calf Raise', 'Single Leg Calf Raise', 'Jump Rope', 'Box Jump', 'Farmer Walk Calf Raise', 'Smith Machine Calf Raise', 'Tibialis Raise'],
  ABS: ['Plank', 'Crunch', 'Hanging Leg Raise', 'Russian Twist', 'Cable Crunch', 'Ab Wheel Rollout', 'Mountain Climber', 'Dead Bug', 'Bicycle Crunch', 'Reverse Crunch'],
  CARDIO: ['Treadmill Run', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Jump Rope Intervals', 'Burpee', 'High Knees', 'Battle Rope', 'Stair Climber', 'Sprint Interval']
}

const titleCase = (value) => {
  return value.toLowerCase().split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')
}

const seedMusclesAndExercises = async () => {
  const muscles = {}
  const exercises = {}

  for (const group of muscleGroups) {
    const muscle = await prisma.muscle.upsert({
      where: { group },
      update: { name: titleCase(group), image_url: '' },
      create: { group, name: titleCase(group), image_url: '' }
    })
    muscles[group] = muscle

    exercises[group] = []
    for (const name of exercisesByGroup[group]) {
      const mapping = exerciseImagesByGroup[group]
      const imageUrl = mapping && mapping[name] ? mapping[name] : ''
      const exercise = await prisma.exercise.upsert({
        where: { name },
        update: {
          description: `${name} targets ${titleCase(group)} for balanced strength and conditioning.`,
          instructions: `Perform ${name} with controlled tempo, full range of motion, and steady breathing.`,
          image_url: imageUrl,
          muscle_id: muscle.id
        },
        create: {
          name,
          description: `${name} targets ${titleCase(group)} for balanced strength and conditioning.`,
          instructions: `Perform ${name} with controlled tempo, full range of motion, and steady breathing.`,
          image_url: imageUrl,
          muscle_id: muscle.id
        }
      })
      exercises[group].push(exercise)
    }
  }

  return exercises
}

const groupsForDay = (workoutType, index) => {
  if (workoutType === 'FULL_BODY') {
    return [
      ['CHEST', 'BACK', 'QUADS', 'ABS'],
      ['SHOULDERS', 'HAMSTRINGS', 'GLUTES', 'CARDIO'],
      ['BICEPS', 'TRICEPS', 'CALVES', 'FOREARMS']
    ][index]
  }

  if (workoutType === 'DOUBLE') {
    return [
      ['CHEST', 'TRICEPS'],
      ['BACK', 'BICEPS'],
      ['QUADS', 'HAMSTRINGS']
    ][index]
  }

  return [['CHEST'], ['BACK'], ['LEGS']][index].map((group) => group === 'LEGS' ? 'QUADS' : group)
}

const seedTemplates = async (exercises) => {
  await prisma.planDayExercise.deleteMany()
  await prisma.planDayTemplate.deleteMany()

  for (const goal of goals) {
    for (const routine_type of routineTypes) {
      for (const workout_type of workoutTypes) {
        const template = await prisma.planTemplate.upsert({
          where: {
            goal_routine_type_workout_type: {
              goal,
              routine_type,
              workout_type
            }
          },
          update: {
            description: `${titleCase(goal)} plan using ${titleCase(routine_type)} ${titleCase(workout_type)} training.`
          },
          create: {
            goal,
            routine_type,
            workout_type,
            description: `${titleCase(goal)} plan using ${titleCase(routine_type)} ${titleCase(workout_type)} training.`
          }
        })

        for (let index = 0; index < 3; index++) {
          const groups = groupsForDay(workout_type, index)
          const dayTemplate = await prisma.planDayTemplate.create({
            data: {
              plan_template_id: template.id,
              day_number: index + 1,
              day_of_week: dayOfWeekByRoutine[routine_type][index],
              workout_type,
              label: `${titleCase(workout_type)} Day ${index + 1}`
            }
          })

          const selected = groups.flatMap((group) => exercises[group].slice(index * 2, index * 2 + 2))
          for (let order = 0; order < selected.length; order++) {
            await prisma.planDayExercise.create({
              data: {
                plan_day_template_id: dayTemplate.id,
                exercise_id: selected[order].id,
                recommended_sets: workout_type === 'FULL_BODY' ? 3 : 4,
                recommended_reps: goal === 'MUSCLE_GAIN' ? 8 : 12,
                order: order + 1
              }
            })
          }
        }
      }
    }
  }
}

async function main() {
  const exercises = await seedMusclesAndExercises()
  await seedTemplates(exercises)
  console.log('Seed completed successfully')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
