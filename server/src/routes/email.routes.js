const express     = require('express')
const router      = express.Router()
const verifyToken = require('../middleware/verifyToken')
const verifyAdmin = require('../middleware/verifyAdmin')
const emailController = require('../controllers/email.controller')

router.use(verifyToken)

// Send fee reminders for all overdue fees
router.post('/fee-reminders', verifyAdmin, emailController.sendFeeReminders)

// Send grade notification when a grade is recorded
router.post('/grade-notification', emailController.sendGradeAlert)

// Send message notification
router.post('/message-notification', emailController.sendMessageAlert)

// Send announcement to everyone
router.post('/announcement', verifyAdmin, emailController.sendAnnouncementEmail)

// Send welcome email to new student
router.post('/welcome', verifyAdmin, emailController.sendWelcome)

module.exports = router