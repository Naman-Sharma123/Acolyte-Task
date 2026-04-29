const metricsService = require('../services/metricsService')

async function getMetrics(req, res, next) {
  try {
    const { startDate, endDate } = req.query
    const metrics = await metricsService.getMetrics({ startDate, endDate })
    return res.json(metrics)
  } catch (err) {
    return next(err)
  }
}

module.exports = { getMetrics }

