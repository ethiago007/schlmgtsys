const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Base email template
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body        { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
    .wrapper    { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header     { background: #1e40af; padding: 30px; text-align: center; }
    .header h1  { color: white; margin: 0; font-size: 22px; }
    .header p   { color: #bfdbfe; margin: 8px 0 0; font-size: 13px; }
    .body       { padding: 32px; }
    .body p     { color: #374151; line-height: 1.6; font-size: 14px; }
    .card       { background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #1e40af; }
    .card p     { margin: 6px 0; font-size: 13px; color: #4b5563; }
    .card strong { color: #1f2937; }
    .btn        { display: inline-block; background: #1e40af; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; margin: 20px 0; }
    .footer     { background: #f9fafb; padding: 20px; text-align: center; }
    .footer p   { color: #9ca3af; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏫 SchoolMS</h1>
      <p>School Management System</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SchoolMS · This is an automated message</p>
    </div>
  </div>
</body>
</html>
`

// Send any email
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}

// ── Email Templates ───────────────────────────────────────

// New grade notification to student
const sendGradeNotification = async ({ studentEmail, studentName, subject, grade, total, term, session }) => {
  const gradeColors = { A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#ea580c', E: '#dc2626', F: '#7f1d1d' }
  const color       = gradeColors[grade] || '#6b7280'

  await sendEmail({
    to:      studentEmail,
    subject: `New Grade Posted — ${subject} · ${term}`,
    html:    baseTemplate(`
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>A new grade has been recorded for you:</p>
      <div class="card">
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Total Score:</strong> ${total}/100</p>
        <p><strong>Grade:</strong> <span style="color:${color};font-weight:bold;font-size:18px">${grade}</span></p>
        <p><strong>Term:</strong> ${term}</p>
        <p><strong>Session:</strong> ${session}</p>
      </div>
      <p>Log in to your student portal to view the full breakdown.</p>
    `),
  })
}

// Fee reminder to student
const sendFeeReminder = async ({ studentEmail, studentName, feeType, amount, dueDate, status }) => {
  const isOverdue   = status === 'Overdue'
  const headerColor = isOverdue ? '#dc2626' : '#d97706'

  await sendEmail({
    to:      studentEmail,
    subject: `${isOverdue ? '⚠️ Overdue' : '📢 Fee Reminder'} — ${feeType}`,
    html:    baseTemplate(`
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>${isOverdue ? 'You have an <strong>overdue</strong> fee payment.' : 'This is a reminder about an upcoming fee payment.'}</p>
      <div class="card" style="border-left-color:${headerColor}">
        <p><strong>Fee Type:</strong> ${feeType}</p>
        <p><strong>Amount:</strong> ₦${Number(amount).toLocaleString()}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Status:</strong> <span style="color:${headerColor};font-weight:bold">${status}</span></p>
      </div>
      <p>Please make payment as soon as possible to avoid any issues.</p>
    `),
  })
}

// New message notification
const sendMessageNotification = async ({ recipientEmail, recipientName, senderName, subject, messagePreview }) => {
  await sendEmail({
    to:      recipientEmail,
    subject: `New Message from ${senderName} — ${subject}`,
    html:    baseTemplate(`
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>You have a new message from <strong>${senderName}</strong>:</p>
      <div class="card">
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Preview:</strong> ${messagePreview.substring(0, 150)}${messagePreview.length > 150 ? '...' : ''}</p>
      </div>
      <p>Log in to your portal to read and reply to this message.</p>
    `),
  })
}

// Announcement notification
const sendAnnouncementNotification = async ({ recipientEmail, recipientName, subject, message }) => {
  await sendEmail({
    to:      recipientEmail,
    subject: `📢 School Announcement — ${subject}`,
    html:    baseTemplate(`
      <p>Hello <strong>${recipientName}</strong>,</p>
      <p>There is a new announcement from your school:</p>
      <div class="card">
        <p><strong>${subject}</strong></p>
        <p style="margin-top:10px">${message}</p>
      </div>
      <p>Log in to your portal for more details.</p>
    `),
  })
}

// Welcome email for new student
const sendWelcomeEmail = async ({ email, firstName, lastName, className }) => {
  await sendEmail({
    to:      email,
    subject: 'Welcome to SchoolMS — Your Account is Ready',
    html:    baseTemplate(`
      <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
      <p>Welcome to SchoolMS! Your student account has been created successfully.</p>
      <div class="card">
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Class:</strong> ${className}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      <p>You can log in to your student portal to view your grades, attendance, fees, and more.</p>
      <p>If you have any questions, please contact your school admin.</p>
    `),
  })
}

module.exports = {
  sendGradeNotification,
  sendFeeReminder,
  sendMessageNotification,
  sendAnnouncementNotification,
  sendWelcomeEmail,
}