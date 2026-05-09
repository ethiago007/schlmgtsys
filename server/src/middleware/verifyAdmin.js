const { db } = require('../firebase/admin.config')
const { sendError } = require('../utils/response')

const verifyAdmin = async (req, res, next) => {
  try {
    const uid     = req.user.uid
    const userDoc = await db.collection('users').doc(uid).get()

    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return sendError(res, 'Admin access required', 403)
    }

    next()
  } catch (error) {
    return sendError(res, 'Authorization failed', 403)
  }
}

module.exports = verifyAdmin