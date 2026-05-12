const express     = require('express')
const router      = express.Router()
const verifyToken = require('../middleware/verifyToken')
const reportCardController = require('../controllers/reportcard.controller')

router.use(verifyToken)
router.get('/:studentId', reportCardController.generate)

module.exports = router