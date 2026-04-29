const reportService = require('../services/reportService')

async function listReport(req, res, next) {
  try {
    const {
      startDate,
      endDate,
      city,
      status,
      service,
      page,
      limit,
    } = req.query

    const result = await reportService.getFilteredLeads({
      startDate,
      endDate,
      city,
      status,
      service,
      page,
      limit,
    })

    return res.json(result)
  } catch (err) {
    return next(err)
  }
}

async function exportReport(req, res, next) {
  try {
    const { format, startDate, endDate, city, status, service } = req.query
    if (!format || !['csv', 'xlsx'].includes(String(format).toLowerCase())) {
      return res.status(400).json({ message: 'format must be csv or xlsx' })
    }

    const out = await reportService.exportFilteredLeads({
      format: String(format).toLowerCase(),
      startDate,
      endDate,
      city,
      status,
      service,
    })

    res.setHeader('Content-Type', out.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`)
    return res.send(out.buffer)
  } catch (err) {
    return next(err)
  }
}

module.exports = { listReport, exportReport }

