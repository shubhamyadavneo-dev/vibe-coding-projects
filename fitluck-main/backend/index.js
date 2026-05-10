require('dotenv').config()
const connectDB = require('./src/db/connection')
const app = require('./src/app')

const PORT = process.env.PORT || 3000

async function startServer() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()