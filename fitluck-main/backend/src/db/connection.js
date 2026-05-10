const prisma = require('../../prisma/client')

async function connectDB() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1) // Stop server if DB fails
  }
}

module.exports = connectDB