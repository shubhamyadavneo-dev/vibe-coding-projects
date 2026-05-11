const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/profile', require('./routes/profile'))
app.use('/api', require('./routes/exercise'))
app.use('/api/plan', require('./routes/plan'))
app.use('/api/logs', require('./routes/log'))
app.use('/api/progress', require('./routes/progress'))
app.use('/api/progress-photos', require('./routes/progressPhotos'))
app.use('/api/workout-templates', require('./routes/workoutTemplates'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/badges', require('./routes/badges'))

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Fitness Tracker API is running 🏋️' })
})

module.exports = app
