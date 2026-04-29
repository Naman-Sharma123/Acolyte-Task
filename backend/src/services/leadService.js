const mongoose = require('mongoose')
const { Lead } = require('../models/Lead')

async function createLead(data) {
  const lead = await Lead.create(data)
  return lead
}

async function getLeadById(id) {
  if (!mongoose.isValidObjectId(id)) return null
  return Lead.findById(id).lean()
}

async function updateLead(id, data) {
  if (!mongoose.isValidObjectId(id)) return null
  return Lead.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
}

async function listLeads({ page = 1, limit = 25 } = {}) {
  page = Math.max(1, Number(page))
  limit = Math.max(1, Math.min(100, Number(limit)))

  const skip = (page - 1) * limit
  const [total, leads] = await Promise.all([
    Lead.countDocuments(),
    Lead.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ])

  return { total, leads, page, limit }
}

module.exports = { createLead, getLeadById, updateLead, listLeads }

