const { ZodError } = require('zod')

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' })
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _ = next

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues,
    })
  }

  if (err && err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid id',
    })
  }

  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
}

module.exports = { notFoundHandler, errorHandler }

