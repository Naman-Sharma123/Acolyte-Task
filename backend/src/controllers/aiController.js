const aiInsightsService = require('../services/aiInsightsService')

async function getInsights(req, res, next) {
  try {
    const data = await aiInsightsService.getAiInsights()
    return res.json(data)
  } catch (err) {
    return next(err)
  }
}

module.exports = { getInsights }

