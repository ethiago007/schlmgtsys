const express     = require('express')
const router      = express.Router()
const verifyToken = require('../middleware/verifyToken')
const verifyAdmin = require('../middleware/verifyAdmin')
const reportController = require('../controllers/report.controller')

router.use(verifyToken)

// Get full report card for a student
router.get('/student/:studentId', reportController.getStudentReport)

// Get class performance summary
router.get('/class/:className',   verifyAdmin, reportController.getClassReport)

module.exports = router