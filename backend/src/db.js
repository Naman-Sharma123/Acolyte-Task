const mongoose = require('mongoose')

async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI')
  }

  // Mongoose connection with sensible timeouts for local runs.
  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  })
}

module.exports = { connectDB }

