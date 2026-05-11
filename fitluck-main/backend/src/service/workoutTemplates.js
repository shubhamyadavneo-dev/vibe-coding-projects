const workoutTemplatesRepository = require('../repository/workoutTemplates')

const getTemplates = async (user_id) => {
  return workoutTemplatesRepository.findByUserId(user_id)
}

const createTemplate = async (user_id, data) => {
  if (!data.name) throw new Error('Template name is required')
  if (!Array.isArray(data.exercises) || data.exercises.length === 0) throw new Error('At least one exercise is required')

  return workoutTemplatesRepository.create({
    user_id,
    name: data.name,
    exercises: data.exercises,
  })
}

const deleteTemplate = async (user_id, templateId) => {
  const template = await workoutTemplatesRepository.findById(templateId, user_id)
  if (!template) throw new Error('Template not found')

  await workoutTemplatesRepository.deleteById(templateId, user_id)
  return { message: 'Template deleted successfully' }
}

module.exports = {
  getTemplates,
  createTemplate,
  deleteTemplate,
}
