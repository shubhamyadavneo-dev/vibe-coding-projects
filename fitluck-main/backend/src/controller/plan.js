const planService = require('../service/plan')

const createPlan = async (req, res) => {
  try {
    const plan = await planService.createPlan(req.user.id, req.body)
    res.status(201).json(plan)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getActivePlan = async (req, res) => {
  try {
    const plan = await planService.getActivePlan(req.user.id)
    res.status(200).json(plan)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const killActivePlan = async (req, res) => {
  try {
    const result = await planService.killActivePlan(req.user.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getTodayPlanDay = async (req, res) => {
  try {
    const day = await planService.getTodayPlanDay(req.user.id)
    res.status(200).json(day)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getPlanDays = async (req, res) => {
  try {
    const days = await planService.getPlanDays(req.user.id)
    res.status(200).json(days)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getPlanDayById = async (req, res) => {
  try {
    const day = await planService.getPlanDayById(req.user.id, req.params.id)
    res.status(200).json(day)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

module.exports = {
  createPlan,
  getActivePlan,
  killActivePlan,
  getTodayPlanDay,
  getPlanDays,
  getPlanDayById
}
