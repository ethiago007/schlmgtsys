if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

require('express-async-errors')

const express = require('express')
const cors     = require('cors')
const helmet   = require('helmet')
const morgan   = require('morgan')

const studentRoutes    = require('./src/routes/student.routes')
const reportRoutes     = require('./src/routes/report.routes')
const reportCardRoutes = require('./src/routes/reportcard.routes')
const emailRoutes      = require('./src/routes/email.routes')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ───────────────────────────────────────────
app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))
app.use(express.json())

// ── Routes ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SchoolMS API is running ✅' })
})

app.use('/api/students',    studentRoutes)
app.use('/api/reports',     reportRoutes)
app.use('/api/report-card', reportCardRoutes)
app.use('/api/email',       emailRoutes)

// ── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
    data:    null,
  })
})

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data:    null,
  })
})

// ── Keep Alive (production only) ─────────────────────────
if (process.env.NODE_ENV === 'production') {
  const BACKEND_URL = process.env.RAILWAY_STATIC_URL || ''
  setInterval(async () => {
    try {
      await fetch(`${BACKEND_URL}/`)
      console.log('Keep-alive ping sent')
    } catch (error) {
      console.log('Keep-alive failed:', error.message)
    }
  }, 14 * 60 * 1000)
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})