const prisma = require('../../prisma/client')

const getBadges = async (req, res) => {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { user_id: req.user.id },
      include: { badge: true },
      orderBy: { earned_at: 'desc' }
    })
    
    // Also fetch all available badges so frontend can show unearned ones
    const allBadges = await prisma.badge.findMany()

    res.status(200).json({
      earned: userBadges,
      all: allBadges
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  getBadges
}
