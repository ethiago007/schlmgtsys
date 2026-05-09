const { db }                    = require('../firebase/admin.config')
const { sendSuccess, sendError } = require('../utils/response')

const COLLECTION = 'students'

// Get all students
const getAll = async (req, res) => {
  const snapshot = await db.collection(COLLECTION).get()
  const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  sendSuccess(res, students)
}

// Get one student
const getOne = async (req, res) => {
  const doc = await db.collection(COLLECTION).doc(req.params.id).get()
  if (!doc.exists) return sendError(res, 'Student not found', 404)
  sendSuccess(res, { id: doc.id, ...doc.data() })
}

// Create student
const create = async (req, res) => {
  const data    = req.body
  const docRef  = await db.collection(COLLECTION).add({
    ...data,
    createdAt: new Date().toISOString(),
  })
  sendSuccess(res, { id: docRef.id }, 'Student created', 201)
}

// Update student
const update = async (req, res) => {
  const { id } = req.params
  const doc    = await db.collection(COLLECTION).doc(id).get()
  if (!doc.exists) return sendError(res, 'Student not found', 404)
  await db.collection(COLLECTION).doc(id).update({
    ...req.body,
    updatedAt: new Date().toISOString(),
  })
  sendSuccess(res, { id }, 'Student updated')
}

// Delete student
const remove = async (req, res) => {
  const { id } = req.params
  const doc    = await db.collection(COLLECTION).doc(id).get()
  if (!doc.exists) return sendError(res, 'Student not found', 404)
  await db.collection(COLLECTION).doc(id).delete()
  sendSuccess(res, { id }, 'Student deleted')
}

module.exports = { getAll, getOne, create, update, remove }