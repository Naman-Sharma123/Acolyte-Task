const { z } = require('zod')

const STATUS_ENUM = ['New', 'Interested', 'Converted', 'Rejected']

const leadBaseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  mobile: z
    .string()
    .trim()
    .min(7, 'Mobile is required')
    .max(20, 'Mobile is too long')
    .regex(/^\+?\d+$/, 'Mobile must contain only digits'),
  email: z.string().trim().email('Email must be valid'),
  city: z.string().trim().min(1, 'City is required'),
  service: z.string().trim().min(1, 'Service is required'),
  budget: z.coerce.number().nonnegative(),
  status: z.enum(STATUS_ENUM),
})

const createLeadSchema = leadBaseSchema
const updateLeadSchema = leadBaseSchema

function validateCreateLead(body) {
  return createLeadSchema.parse(body)
}

function validateUpdateLead(body) {
  return updateLeadSchema.parse(body)
}

module.exports = {
  STATUS_ENUM,
  validateCreateLead,
  validateUpdateLead,
}

