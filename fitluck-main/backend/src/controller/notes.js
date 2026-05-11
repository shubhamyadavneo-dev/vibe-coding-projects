const prisma = require('../../prisma/client')

const getNotes = async (req, res) => {
  try {
    const notes = await prisma.exerciseNote.findMany({
      where: { user_id: req.user.id }
    })
    res.status(200).json(notes)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getNote = async (req, res) => {
  try {
    const exerciseId = Number(req.params.exerciseId)
    const note = await prisma.exerciseNote.findUnique({
      where: {
        user_id_exercise_id: {
          user_id: req.user.id,
          exercise_id: exerciseId
        }
      }
    })
    res.status(200).json(note)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const saveNote = async (req, res) => {
  try {
    const exerciseId = Number(req.params.exerciseId)
    const { note } = req.body

    const savedNote = await prisma.exerciseNote.upsert({
      where: {
        user_id_exercise_id: {
          user_id: req.user.id,
          exercise_id: exerciseId
        }
      },
      update: { note },
      create: {
        user_id: req.user.id,
        exercise_id: exerciseId,
        note
      }
    })

    res.status(200).json(savedNote)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  getNotes,
  getNote,
  saveNote
}
