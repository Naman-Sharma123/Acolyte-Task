require('dotenv').config()

const { createApp } = require('./src/app')
const { connectDB } = require('./src/db')

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI

async function start() {
  await connectDB(MONGODB_URI)
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
