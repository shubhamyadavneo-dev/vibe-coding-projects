const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getNotes, getNote, saveNote } = require('../controller/notes')

router.get('/', protect, getNotes)
router.get('/:exerciseId', protect, getNote)
router.post('/:exerciseId', protect, saveNote)

module.exports = router
