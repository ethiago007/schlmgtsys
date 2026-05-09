const { auth } = require('../firebase/admin.config')
const { sendError } = require('../utils/response')

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401)
    }

    const token       = authHeader.split('Bearer ')[1]
    const decoded     = await auth.verifyIdToken(token)
    req.user          = decoded  // attach user info to request
    next()
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401)
  }
}

module.exports = verifyToken