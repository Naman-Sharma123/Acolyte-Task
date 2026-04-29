const { Lead } = require('../models/Lead')

function buildDateRangeQuery({ startDate, endDate }) {
  const query = {}
  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }
  return query
}

async function getMetrics({ startDate, endDate } = {}) {
  const dateQuery = buildDateRangeQuery({ startDate, endDate })

  const totalLeads = await Lead.countDocuments(dateQuery)

  const [statusAgg, cityAgg, serviceAgg] = await Promise.all([
    Lead.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Lead.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Lead.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ])

  return {
    totalLeads,
    statusCounts: statusAgg,
    cityCounts: cityAgg,
    serviceCounts: serviceAgg,
  }
}

module.exports = { getMetrics }

