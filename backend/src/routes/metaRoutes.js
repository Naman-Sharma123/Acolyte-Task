const express = require('express')
const metaController = require('../controllers/metaController')

const router = express.Router()

router.get('/options', metaController.options)

module.exports = router

