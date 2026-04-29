const { Lead } = require('../models/Lead')
const xlsx = require('xlsx')

function buildFilters({ startDate, endDate, city, status, service }) {
  const query = {}
  if (city) query.city = city
  if (status) query.status = status
  if (service) query.service = service

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) {
      // Inclusive: push to end of provided day in local time.
      const d = new Date(endDate)
      d.setHours(23, 59, 59, 999)
      query.createdAt.$lte = d
    }
  }

  return query
}

async function getFilteredLeads({
  startDate,
  endDate,
  city,
  status,
  service,
  page = 1,
  limit = 25,
} = {}) {
  page = Math.max(1, Number(page))
  limit = Math.max(1, Math.min(100, Number(limit)))

  const query = buildFilters({ startDate, endDate, city, status, service })
  const skip = (page - 1) * limit

  const [total, leads] = await Promise.all([
    Lead.countDocuments(query),
    Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ])

  return { total, leads, page, limit }
}

function leadsToFlatRows(leads) {
  return leads.map((l) => ({
    name: l.name ?? '',
    mobile: l.mobile ?? '',
    email: l.email ?? '',
    city: l.city ?? '',
    service: l.service ?? '',
    budget: l.budget ?? 0,
    status: l.status ?? '',
    createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : '',
    updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : '',
  }))
}

async function exportFilteredLeads({
  format,
  startDate,
  endDate,
  city,
  status,
  service,
} = {}) {
  const query = buildFilters({ startDate, endDate, city, status, service })
  const leads = await Lead.find(query).sort({ createdAt: -1 }).lean()
  const rows = leadsToFlatRows(leads)

  const safeSuffix = `from_${startDate || 'any'}_to_${endDate || 'any'}`
  const filenameBase = `lead_report_${safeSuffix}`

  if (format === 'csv') {
    // json2csv is already a dependency, but its API differs by version;
    // requiring the right constructor here keeps it robust.
    const { Parser } = require('json2csv')
    const fields = [
      'name',
      'mobile',
      'email',
      'city',
      'service',
      'budget',
      'status',
      'createdAt',
      'updatedAt',
    ]
    const parser = new Parser({ fields })
    const csv = parser.parse(rows)
    return {
      filename: `${filenameBase}.csv`,
      contentType: 'text/csv',
      buffer: Buffer.from(csv, 'utf8'),
    }
  }

  // xlsx
  const worksheet = xlsx.utils.json_to_sheet(rows)
  const workbook = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Leads')
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return {
    filename: `${filenameBase}.xlsx`,
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  }
}

module.exports = {
  getFilteredLeads,
  exportFilteredLeads,
}

