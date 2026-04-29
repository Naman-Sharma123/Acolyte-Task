const { Lead, STATUS_ENUM } = require('../models/Lead')

async function options(req, res, next) {
  try {
    const [cities, services] = await Promise.all([
      Lead.distinct('city'),
      Lead.distinct('service'),
    ])

    return res.json({
      cities: cities.filter(Boolean).sort(),
      services: services.filter(Boolean).sort(),
      statuses: STATUS_ENUM,
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = { options }

