const logService = require('../service/log')

const createLog = async (req, res) => {
  try {
    const log = await logService.createLog(req.user.id, req.params.planDayId, req.body)
    res.status(201).json(log)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateLog = async (req, res) => {
  try {
    const log = await logService.updateLog(req.user.id, req.params.planDayId, req.body)
    res.status(200).json(log)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getLog = async (req, res) => {
  try {
    const log = await logService.getLog(req.user.id, req.params.planDayId)
    res.status(200).json(log)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const addSet = async (req, res) => {
  try {
    const set = await logService.addSet(req.user.id, req.params.planDayId, req.body)
    res.status(201).json(set)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateSet = async (req, res) => {
  try {
    const set = await logService.updateSet(req.user.id, req.params.planDayId, req.params.setId, req.body)
    res.status(200).json(set)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteSet = async (req, res) => {
  try {
    const result = await logService.deleteSet(req.user.id, req.params.planDayId, req.params.setId)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  createLog,
  updateLog,
  getLog,
  addSet,
  updateSet,
  deleteSet
}
