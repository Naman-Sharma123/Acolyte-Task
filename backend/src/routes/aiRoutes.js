const express = require('express')
const aiController = require('../controllers/aiController')

const router = express.Router()

router.get('/insights', aiController.getInsights)

module.exports = router

