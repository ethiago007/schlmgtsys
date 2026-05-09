const { db }                    = require('../firebase/admin.config')
const { sendSuccess, sendError } = require('../utils/response')

// Full student report — grades + attendance + fees
const getStudentReport = async (req, res) => {
  const { studentId } = req.params

  // Make sure student can only access their own report
  const requestingUid = req.user.uid
  const userDoc       = await db.collection('users').doc(requestingUid).get()
  const role          = userDoc.data()?.role

  // Fetch student record
  const studentDoc = await db.collection('students').doc(studentId).get()
  if (!studentDoc.exists) return sendError(res, 'Student not found', 404)
  const student = { id: studentDoc.id, ...studentDoc.data() }

  // Non-admin can only see their own report
  if (role !== 'admin' && student.email !== req.user.email) {
    return sendError(res, 'Access denied', 403)
  }

  // Fetch grades
  const gradesSnap = await db.collection('grades')
    .where('studentId', '==', studentId)
    .get()
  const grades = gradesSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Fetch attendance
  const attendanceSnap = await db.collection('attendance').get()
  const myAttendance   = []
  attendanceSnap.docs.forEach(doc => {
    const record   = doc.data()
    const myRecord = record.records?.find(r => r.studentId === studentId)
    if (myRecord) {
      myAttendance.push({
        date:   record.date,
        class:  record.class,
        status: myRecord.status,
      })
    }
  })

  // Fetch fees
  const feesSnap = await db.collection('fees')
    .where('studentId', '==', studentId)
    .get()
  const fees = feesSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Calculate summaries
  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((s, g) => s + g.total, 0) / grades.length)
    : 0

  const presentDays  = myAttendance.filter(a => a.status === 'present').length
  const attendanceRate = myAttendance.length > 0
    ? Math.round((presentDays / myAttendance.length) * 100)
    : 0

  const totalFeesPaid = fees
    .filter(f => f.status === 'Paid')
    .reduce((s, f) => s + f.amount, 0)

  sendSuccess(res, {
    student,
    grades,
    attendance: myAttendance,
    fees,
    summary: {
      averageScore: avgScore,
      attendanceRate,
      totalFeesPaid,
      totalGrades:    grades.length,
      totalAbsent:    myAttendance.length - presentDays,
    },
  })
}

// Class performance summary
const getClassReport = async (req, res) => {
  const { className } = req.params

  const studentsSnap = await db.collection('students')
    .where('class', '==', className)
    .get()
  const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  const gradesSnap = await db.collection('grades')
    .where('studentClass', '==', className)
    .get()
  const grades = gradesSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((s, g) => s + g.total, 0) / grades.length)
    : 0

  // Top 5 students by average
  const studentScores = students.map(student => {
    const studentGrades = grades.filter(g => g.studentId === student.id)
    const avg = studentGrades.length > 0
      ? Math.round(studentGrades.reduce((s, g) => s + g.total, 0) / studentGrades.length)
      : 0
    return {
      id:        student.id,
      name:      `${student.firstName} ${student.lastName}`,
      average:   avg,
      subjects:  studentGrades.length,
    }
  }).sort((a, b) => b.average - a.average)

  sendSuccess(res, {
    className,
    totalStudents: students.length,
    classAverage:  avgScore,
    topStudents:   studentScores.slice(0, 5),
    allStudents:   studentScores,
  })
}

module.exports = { getStudentReport, getClassReport }