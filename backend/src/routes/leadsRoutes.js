const express = require('express')
const leadsController = require('../controllers/leadsController')

const router = express.Router()

router.post('/', leadsController.createLead)
router.get('/', leadsController.listLeads)
router.get('/:id', leadsController.getLead)
router.put('/:id', leadsController.updateLead)

module.exports = router

