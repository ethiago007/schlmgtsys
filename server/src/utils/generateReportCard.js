const PDFDocument = require('pdfkit')

const getGradeLetter = (score) => {
  if (score >= 70) return { grade: 'A', remark: 'Excellent' }
  if (score >= 60) return { grade: 'B', remark: 'Very Good' }
  if (score >= 50) return { grade: 'C', remark: 'Good' }
  if (score >= 45) return { grade: 'D', remark: 'Pass' }
  if (score >= 40) return { grade: 'E', remark: 'Poor' }
  return { grade: 'F', remark: 'Fail' }
}

const generateReportCard = (doc, { student, grades, attendance, term, session }) => {
  const pageWidth  = doc.page.width
  const margin     = 50
  const contentWidth = pageWidth - margin * 2

  // ── Header ───────────────────────────────────────────────
  doc
    .fillColor('#1e40af')
    .rect(0, 0, pageWidth, 100)
    .fill()

  doc
    .fillColor('white')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('SCHOOL MANAGEMENT SYSTEM', margin, 25, { align: 'center' })
    .fontSize(12)
    .font('Helvetica')
    .text('Student Report Card', margin, 58, { align: 'center' })
    .text(`${term} · ${session}`, margin, 76, { align: 'center' })

  // ── Student Info ─────────────────────────────────────────
  doc.fillColor('#1f2937').fontSize(10).font('Helvetica')

  doc
    .roundedRect(margin, 115, contentWidth, 80, 8)
    .fillAndStroke('#f8fafc', '#e2e8f0')

  doc.fillColor('#1f2937')
  const infoY = 130

  doc.font('Helvetica-Bold').text('Student Name:', margin + 15, infoY)
  doc.font('Helvetica').text(`${student.firstName} ${student.lastName}`, margin + 110, infoY)

  doc.font('Helvetica-Bold').text('Class:', margin + 15, infoY + 20)
  doc.font('Helvetica').text(student.class, margin + 110, infoY + 20)

  doc.font('Helvetica-Bold').text('Gender:', margin + 15, infoY + 40)
  doc.font('Helvetica').text(student.gender, margin + 110, infoY + 40)

  // Right column
  doc.font('Helvetica-Bold').text('Date of Birth:', margin + 280, infoY)
  doc.font('Helvetica').text(student.dateOfBirth || 'N/A', margin + 370, infoY)

  doc.font('Helvetica-Bold').text('Status:', margin + 280, infoY + 20)
  doc.font('Helvetica').text(student.status || 'Active', margin + 370, infoY + 20)

  if (student.isSpecialCase) {
    doc.font('Helvetica-Bold').text('Admission:', margin + 280, infoY + 40)
    doc.font('Helvetica').text('Special Case', margin + 370, infoY + 40)
  }

  // ── Grades Table ─────────────────────────────────────────
  let y = 215

  doc
    .fillColor('#1e40af')
    .roundedRect(margin, y, contentWidth, 28, 4)
    .fill()

  doc
    .fillColor('white')
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('ACADEMIC PERFORMANCE', margin, y + 8, { align: 'center', width: contentWidth })

  y += 38

  // Table header
  const colWidths = { subject: 180, cTest: 65, midTerm: 65, exam: 65, total: 65, grade: 55 }
  const cols = {
    subject: margin,
    cTest:   margin + 180,
    midTerm: margin + 245,
    exam:    margin + 310,
    total:   margin + 375,
    grade:   margin + 440,
  }

  doc
    .fillColor('#f1f5f9')
    .rect(margin, y, contentWidth, 22)
    .fill()

  doc
    .fillColor('#374151')
    .font('Helvetica-Bold')
    .fontSize(9)

  doc.text('SUBJECT',       cols.subject + 5, y + 7)
  doc.text('C. TEST',       cols.cTest,       y + 7, { width: 60, align: 'center' })
  doc.text('MID TERM',      cols.midTerm,     y + 7, { width: 60, align: 'center' })
  doc.text('EXAM',          cols.exam,        y + 7, { width: 60, align: 'center' })
  doc.text('TOTAL',         cols.total,       y + 7, { width: 60, align: 'center' })
  doc.text('GRADE',         cols.grade,       y + 7, { width: 50, align: 'center' })

  y += 22

  // Table rows
  let totalScore   = 0
  let subjectCount = 0

  grades.forEach((grade, index) => {
    const rowColor = index % 2 === 0 ? 'white' : '#f9fafb'
    doc.fillColor(rowColor).rect(margin, y, contentWidth, 20).fill()
    doc.strokeColor('#e5e7eb').lineWidth(0.5)
      .moveTo(margin, y + 20).lineTo(margin + contentWidth, y + 20).stroke()

    doc.fillColor('#1f2937').font('Helvetica').fontSize(9)
    doc.text(grade.subject,          cols.subject + 5, y + 6)
    doc.text(String(grade.classTest), cols.cTest,      y + 6, { width: 60, align: 'center' })
    doc.text(String(grade.midTerm),   cols.midTerm,    y + 6, { width: 60, align: 'center' })
    doc.text(String(grade.exam),      cols.exam,       y + 6, { width: 60, align: 'center' })
    doc.text(String(grade.total),     cols.total,      y + 6, { width: 60, align: 'center' })

    // Grade badge color
    const gradeColors = {
      A: '#16a34a', B: '#2563eb', C: '#d97706',
      D: '#ea580c', E: '#dc2626', F: '#7f1d1d',
    }
    doc
      .fillColor(gradeColors[grade.grade] || '#6b7280')
      .font('Helvetica-Bold')
      .text(grade.grade, cols.grade, y + 6, { width: 50, align: 'center' })

    totalScore   += grade.total
    subjectCount += 1
    y            += 20
  })

  // ── Summary Row ──────────────────────────────────────────
  const average      = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0
  const { grade: overallGrade, remark } = getGradeLetter(average)

  doc
    .fillColor('#1e40af')
    .rect(margin, y, contentWidth, 24)
    .fill()

  doc.fillColor('white').font('Helvetica-Bold').fontSize(9)
  doc.text(`AVERAGE — ${subjectCount} SUBJECTS`, cols.subject + 5, y + 8)
  doc.text(String(average), cols.total, y + 8, { width: 60, align: 'center' })
  doc.text(overallGrade,    cols.grade, y + 8, { width: 50, align: 'center' })

  y += 34

  // ── Attendance Summary ────────────────────────────────────
  const presentDays    = attendance.filter(a => a.status === 'present').length
  const totalDays      = attendance.length
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  doc
    .fillColor('#f8fafc')
    .roundedRect(margin, y, contentWidth, 60, 6)
    .fillAndStroke('#f8fafc', '#e2e8f0')

  doc.fillColor('#1e40af').font('Helvetica-Bold').fontSize(10)
    .text('ATTENDANCE SUMMARY', margin + 15, y + 10)

  doc.fillColor('#374151').font('Helvetica').fontSize(9)
  doc.text(`Days Present: ${presentDays}`,   margin + 15,            y + 28)
  doc.text(`Days Absent: ${totalDays - presentDays}`, margin + 130,  y + 28)
  doc.text(`Total Days: ${totalDays}`,        margin + 250,           y + 28)
  doc.text(`Attendance Rate: ${attendanceRate}%`, margin + 370,       y + 28)

  // Rate bar
  doc.fillColor('#e5e7eb').roundedRect(margin + 15, y + 44, 200, 8, 4).fill()
  const barColor = attendanceRate >= 75 ? '#16a34a' : '#dc2626'
  doc.fillColor(barColor).roundedRect(margin + 15, y + 44, 200 * (attendanceRate / 100), 8, 4).fill()

  y += 70

  // ── Overall Remark ────────────────────────────────────────
  doc
    .fillColor('#f0fdf4')
    .roundedRect(margin, y, contentWidth, 50, 6)
    .fillAndStroke('#f0fdf4', '#bbf7d0')

  doc.fillColor('#15803d').font('Helvetica-Bold').fontSize(11)
    .text('OVERALL ASSESSMENT', margin + 15, y + 10)

  doc.font('Helvetica').fontSize(10)
    .text(`Grade: ${overallGrade}  ·  Average Score: ${average}%  ·  Remark: ${remark}`, margin + 15, y + 28)

  y += 60

  // ── Footer ────────────────────────────────────────────────
  doc
    .fillColor('#6b7280')
    .fontSize(8)
    .text(
      `Generated on ${new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}  ·  SchoolMS`,
      margin, y, { align: 'center', width: contentWidth }
    )
}

module.exports = generateReportCard