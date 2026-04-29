const mongoose = require('mongoose')

const STATUS_ENUM = ['New', 'Interested', 'Converted', 'Rejected']

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: STATUS_ENUM },
  },
  { timestamps: true },
)

module.exports = {
  Lead: mongoose.model('Lead', leadSchema),
  STATUS_ENUM,
}

