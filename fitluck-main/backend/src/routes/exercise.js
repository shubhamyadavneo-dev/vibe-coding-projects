const express = require('express')
const router = express.Router()
const { getExercises, getExerciseById, getMuscles } = require('../controller/exercise')

router.get('/exercises', getExercises)
router.get('/exercises/:id', getExerciseById)
router.get('/muscles', getMuscles)

module.exports = router
