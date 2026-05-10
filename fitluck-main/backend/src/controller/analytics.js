const analyticsService = require('../service/analytics')

const getStats = async (req, res) => {
  try {
    const stats = await analyticsService.getStats(req.user.id)
    res.status(200).json(stats)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getConsistency = async (req, res) => {
  try {
    const consistency = await analyticsService.getConsistency(req.user.id)
    res.status(200).json(consistency)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getStrength = async (req, res) => {
  try {
    const strength = await analyticsService.getStrength(req.user.id, req.params.exerciseId)
    res.status(200).json(strength)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getCalendar = async (req, res) => {
  try {
    const calendar = await analyticsService.getCalendar(req.user.id)
    res.status(200).json(calendar)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const exportCsv = async (req, res) => {
  try {
    const csv = await analyticsService.exportCsv(req.user.id)
    res.header('Content-Type', 'text/csv')
    res.attachment('workout-history.csv')
    res.status(200).send(csv)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  getStats,
  getConsistency,
  getStrength,
  getCalendar,
  exportCsv
}
