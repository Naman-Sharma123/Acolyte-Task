const { Lead, STATUS_ENUM } = require('../models/Lead')
const { getMetrics } = require('./metricsService')

function buildSummary(metrics) {
  const total = metrics.totalLeads || 0
  const converted = metrics.statusCounts.find((s) => s.name === 'Converted')?.count || 0
  const rejected = metrics.statusCounts.find((s) => s.name === 'Rejected')?.count || 0
  const interested = metrics.statusCounts.find((s) => s.name === 'Interested')?.count || 0
  const conversionRate = total ? (converted / total) * 100 : 0
  const rejectionRate = total ? (rejected / total) * 100 : 0

  return { total, converted, interested, rejected, conversionRate, rejectionRate }
}

function generateHeuristicInsights(metrics) {
  const summary = buildSummary(metrics)
  const topCity = metrics.cityCounts?.[0]?.name || 'N/A'
  const topService = metrics.serviceCounts?.[0]?.name || 'N/A'

  const insights = []
  insights.push(
    `Top demand signal is ${topService} in ${topCity}; prioritize follow-ups there for faster wins.`,
  )

  if (summary.total === 0) {
    insights.push('No lead data yet. Add leads to unlock conversion and quality insights.')
  } else if (summary.conversionRate < 20) {
    insights.push(
      `Conversion is ${summary.conversionRate.toFixed(1)}%. Move 'Interested' leads to a 24-hour callback cadence.`,
    )
  } else {
    insights.push(
      `Conversion is healthy at ${summary.conversionRate.toFixed(1)}%. Scale what works for converted segments.`,
    )
  }

  if (summary.rejectionRate > 35) {
    insights.push(
      `Rejection rate is ${summary.rejectionRate.toFixed(1)}%. Re-check lead qualification and budget fit before outreach.`,
    )
  } else {
    insights.push(
      `Rejection rate is controlled at ${summary.rejectionRate.toFixed(1)}%. Keep status updates consistent.`,
    )
  }

  return {
    model: 'heuristic-v1',
    generatedAt: new Date().toISOString(),
    summary: {
      ...summary,
      topCity,
      topService,
    },
    insights,
    supportedStatuses: STATUS_ENUM,
  }
}

async function getAiInsights() {
  const metrics = await getMetrics()
  return generateHeuristicInsights(metrics)
}

module.exports = { getAiInsights }

