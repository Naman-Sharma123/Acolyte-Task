const { validateCreateLead, validateUpdateLead } = require('../validators/leadSchemas')
const leadService = require('../services/leadService')

async function createLead(req, res, next) {
  try {
    const data = validateCreateLead(req.body)
    const lead = await leadService.createLead(data)
    return res.status(201).json({ lead })
  } catch (err) {
    return next(err)
  }
}

async function listLeads(req, res, next) {
  try {
    const { page, limit } = req.query
    const result = await leadService.listLeads({ page, limit })
    return res.json(result)
  } catch (err) {
    return next(err)
  }
}

async function getLead(req, res, next) {
  try {
    const { id } = req.params
    const lead = await leadService.getLeadById(id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    return res.json({ lead })
  } catch (err) {
    return next(err)
  }
}

async function updateLead(req, res, next) {
  try {
    const { id } = req.params
    const data = validateUpdateLead(req.body)
    const updated = await leadService.updateLead(id, data)
    if (!updated) return res.status(404).json({ message: 'Lead not found' })
    return res.json({ lead: updated })
  } catch (err) {
    return next(err)
  }
}

module.exports = { createLead, listLeads, getLead, updateLead }

