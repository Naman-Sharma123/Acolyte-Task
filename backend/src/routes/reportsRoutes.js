const express = require('express')
const reportsController = require('../controllers/reportsController')

const router = express.Router()

router.get('/leads', reportsController.listReport)
router.get('/leads/export', reportsController.exportReport)

module.exports = router

