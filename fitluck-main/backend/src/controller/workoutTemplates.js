const workoutTemplatesService = require('../service/workoutTemplates')

const getWorkoutTemplates = async (req, res) => {
  try {
    const templates = await workoutTemplatesService.getTemplates(req.user.id)
    res.status(200).json(templates)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const createWorkoutTemplate = async (req, res) => {
  try {
    const template = await workoutTemplatesService.createTemplate(req.user.id, req.body)
    res.status(201).json(template)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteWorkoutTemplate = async (req, res) => {
  try {
    const result = await workoutTemplatesService.deleteTemplate(req.user.id, req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const shareWorkoutTemplate = async (req, res) => {
  try {
    const result = await workoutTemplatesService.shareTemplate(req.user.id, req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getSharedWorkoutTemplate = async (req, res) => {
  try {
    const result = await workoutTemplatesService.getSharedTemplate(req.params.id)
    res.status(200).json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

module.exports = {
  getWorkoutTemplates,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  shareWorkoutTemplate,
  getSharedWorkoutTemplate
}
