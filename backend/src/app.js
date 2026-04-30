const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const leadsRoutes = require('./routes/leadsRoutes')
const metricsRoutes = require('./routes/metricsRoutes')
const reportsRoutes = require('./routes/reportsRoutes')
const metaRoutes = require('./routes/metaRoutes')
const aiRoutes = require('./routes/aiRoutes')
const { notFoundHandler, errorHandler } = require('./utils/errorHandlers')

function createApp() {
  const app = express()

  // Trust proxies if deployed behind a reverse proxy/load balancer.
  app.set('trust proxy', true)

  app.use(helmet())
  app.use(morgan('dev'))

  app.use(express.json({ limit: '1mb' }))

  const rawCorsOrigin = process.env.CORS_ORIGIN || '*'
  const allowedOrigins = rawCorsOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  const corsOrigin =
    allowedOrigins.length === 0 || allowedOrigins.includes('*')
      ? '*'
      : (origin, cb) => {
          // Allow same-origin/non-browser requests and listed origins.
          if (!origin || allowedOrigins.includes(origin)) {
            cb(null, true)
            return
          }
          cb(new Error(`CORS blocked for origin: ${origin}`))
        }

  app.use(
    cors({
      origin: corsOrigin,
      credentials: false,
    }),
  )

  app.get('/health', (req, res) => res.json({ ok: true }))

  app.use('/api/leads', leadsRoutes)
  app.use('/api/metrics', metricsRoutes)
  app.use('/api/reports', reportsRoutes)
  app.use('/api/meta', metaRoutes)
  app.use('/api/ai', aiRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }

