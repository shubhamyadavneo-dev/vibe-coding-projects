const prisma = require('../../prisma/client')

const BADGES = [
  { name: 'First Workout', description: 'Complete your first workout', icon: '🎯' },
  { name: 'Consistency King', description: 'Complete 5 workouts', icon: '👑' },
  { name: 'Dedicated', description: 'Complete 10 workouts', icon: '🔥' },
  { name: 'Unstoppable', description: 'Complete 50 workouts', icon: '⚡' },
]

const initializeBadges = async () => {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    })
  }
}

const checkAndAwardBadges = async (userId) => {
  // Ensure badges exist
  await initializeBadges()

  // Get user's completed workouts count
  const completedLogsCount = await prisma.workoutLog.count({
    where: {
      user_id: userId,
      completed: true
    }
  })

  // Get user's earned badges
  const earnedBadges = await prisma.userBadge.findMany({
    where: { user_id: userId },
    include: { badge: true }
  })
  const earnedBadgeNames = new Set(earnedBadges.map(ub => ub.badge.name))

  const newBadges = []

  const awardBadge = async (badgeName) => {
    if (!earnedBadgeNames.has(badgeName)) {
      const badge = await prisma.badge.findUnique({ where: { name: badgeName } })
      if (badge) {
        await prisma.userBadge.create({
          data: {
            user_id: userId,
            badge_id: badge.id
          }
        })
        newBadges.push(badge)
      }
    }
  }

  if (completedLogsCount >= 1) await awardBadge('First Workout')
  if (completedLogsCount >= 5) await awardBadge('Consistency King')
  if (completedLogsCount >= 10) await awardBadge('Dedicated')
  if (completedLogsCount >= 50) await awardBadge('Unstoppable')

  return newBadges
}

module.exports = {
  checkAndAwardBadges
}
