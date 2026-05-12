const PDFDocument      = require('pdfkit')
const { db, auth }     = require('../firebase/admin.config')
const generateReportCard = require('../utils/generateReportCard')
const { sendError }    = require('../utils/response')

const generate = async (req, res) => {
  try {
    const { studentId }  = req.params
    const { term, session } = req.query

    if (!term || !session) {
      return sendError(res, 'term and session query params are required', 400)
    }

    // Verify access — admin sees all, student sees own
    const userDoc  = await db.collection('users').doc(req.user.uid).get()
    const userRole = userDoc.data()?.role

    // Fetch student
    const studentDoc = await db.collection('students').doc(studentId).get()
    if (!studentDoc.exists) return sendError(res, 'Student not found', 404)
    const student = { id: studentDoc.id, ...studentDoc.data() }

    // Students can only get their own report
    if (userRole === 'student' && student.email !== req.user.email) {
      return sendError(res, 'Access denied', 403)
    }

    // Fetch grades for this term and session
    const gradesSnap = await db.collection('grades')
      .where('studentId', '==', studentId)
      .where('term', '==', term)
      .where('session', '==', session)
      .get()
    const grades = gradesSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    if (grades.length === 0) {
      return sendError(res, 'No grades found for this term and session', 404)
    }

    // Fetch attendance
    const attendanceSnap = await db.collection('attendance').get()
    const myAttendance   = []
    attendanceSnap.docs.forEach(doc => {
      const record  = doc.data()
      const myEntry = record.records?.find(r => r.studentId === studentId)
      if (myEntry) myAttendance.push({ date: record.date, status: myEntry.status })
    })

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-card-${student.firstName}-${student.lastName}-${term}.pdf"`
    )

    doc.pipe(res)
    generateReportCard(doc, { student, grades, attendance: myAttendance, term, session })
    doc.end()

  } catch (error) {
    console.error('Report card error:', error)
    sendError(res, 'Failed to generate report card')
  }
}

module.exports = { generate }