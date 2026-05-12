const { db }         = require('../firebase/admin.config')
const emailService   = require('../utils/emailService')
const { sendSuccess, sendError } = require('../utils/response')

// Send fee reminders for all overdue/pending fees
const sendFeeReminders = async (req, res) => {
  try {
    const feesSnap    = await db.collection('fees')
      .where('status', 'in', ['Pending', 'Overdue'])
      .get()

    if (feesSnap.empty) {
      return sendSuccess(res, { sent: 0 }, 'No pending fees found')
    }

    let sent = 0
    const errors = []

    for (const feeDoc of feesSnap.docs) {
      const fee = feeDoc.data()
      try {
        // Get student email
        const studentDoc = await db.collection('students').doc(fee.studentId).get()
        if (!studentDoc.exists) continue
        const student = studentDoc.data()

        await emailService.sendFeeReminder({
          studentEmail: student.email,
          studentName:  `${student.firstName} ${student.lastName}`,
          feeType:      fee.feeType,
          amount:       fee.amount,
          dueDate:      fee.dueDate,
          status:       fee.status,
        })
        sent++
      } catch (error) {
        errors.push({ feeId: feeDoc.id, error: error.message })
      }
    }

    sendSuccess(res, { sent, errors }, `${sent} fee reminders sent`)
  } catch (error) {
    console.error('sendFeeReminders error:', error)
    sendError(res, 'Failed to send fee reminders')
  }
}

// Send grade notification
const sendGradeAlert = async (req, res) => {
  try {
    const { studentId, subject, grade, total, term, session } = req.body

    const studentDoc = await db.collection('students').doc(studentId).get()
    if (!studentDoc.exists) return sendError(res, 'Student not found', 404)
    const student = studentDoc.data()

    await emailService.sendGradeNotification({
      studentEmail: student.email,
      studentName:  `${student.firstName} ${student.lastName}`,
      subject,
      grade,
      total,
      term,
      session,
    })

    sendSuccess(res, null, 'Grade notification sent')
  } catch (error) {
    console.error('sendGradeAlert error:', error)
    sendError(res, 'Failed to send grade notification')
  }
}

// Send message notification
const sendMessageAlert = async (req, res) => {
  try {
    const { recipientId, recipientRole, senderName, subject, messagePreview } = req.body

    let recipientEmail, recipientName

    if (recipientId === 'admin') {
      // Get admin email from users collection
      const adminSnap = await db.collection('users').where('role', '==', 'admin').limit(1).get()
      if (adminSnap.empty) return sendError(res, 'Admin not found', 404)
      const admin     = adminSnap.docs[0].data()
      recipientEmail  = admin.email
      recipientName   = 'Admin'
    } else {
      const collection = recipientRole === 'teacher' ? 'teachers' : 'students'
      const doc        = await db.collection(collection).doc(recipientId).get()
      if (!doc.exists) return sendError(res, 'Recipient not found', 404)
      const person     = doc.data()
      recipientEmail   = person.email
      recipientName    = `${person.firstName} ${person.lastName}`
    }

    await emailService.sendMessageNotification({
      recipientEmail,
      recipientName,
      senderName,
      subject,
      messagePreview,
    })

    sendSuccess(res, null, 'Message notification sent')
  } catch (error) {
    console.error('sendMessageAlert error:', error)
    sendError(res, 'Failed to send message notification')
  }
}

// Send announcement email
const sendAnnouncementEmail = async (req, res) => {
  try {
    const { subject, message, audience } = req.body

    let recipients = []

    if (audience === 'everyone' || audience === 'student') {
      const studentsSnap = await db.collection('students').get()
      studentsSnap.docs.forEach(d => {
        const s = d.data()
        recipients.push({ email: s.email, name: `${s.firstName} ${s.lastName}` })
      })
    }

    if (audience === 'everyone' || audience === 'teacher') {
      const teachersSnap = await db.collection('teachers').get()
      teachersSnap.docs.forEach(d => {
        const t = d.data()
        recipients.push({ email: t.email, name: `${t.firstName} ${t.lastName}` })
      })
    }

    let sent = 0
    for (const recipient of recipients) {
      try {
        await emailService.sendAnnouncementNotification({
          recipientEmail: recipient.email,
          recipientName:  recipient.name,
          subject,
          message,
        })
        sent++
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error.message)
      }
    }

    sendSuccess(res, { sent }, `Announcement sent to ${sent} recipients`)
  } catch (error) {
    console.error('sendAnnouncementEmail error:', error)
    sendError(res, 'Failed to send announcement emails')
  }
}

// Welcome email
const sendWelcome = async (req, res) => {
  try {
    const { email, firstName, lastName, className } = req.body
    await emailService.sendWelcomeEmail({ email, firstName, lastName, className })
    sendSuccess(res, null, 'Welcome email sent')
  } catch (error) {
    console.error('sendWelcome error:', error)
    sendError(res, 'Failed to send welcome email')
  }
}

module.exports = {
  sendFeeReminders,
  sendGradeAlert,
  sendMessageAlert,
  sendAnnouncementEmail,
  sendWelcome,
}