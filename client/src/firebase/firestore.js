import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.config'

// ── Generic Helpers ──────────────────────────────────────

// Get all documents from a collection
export const getCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Get a single document
export const getDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() }
  return null
}

// Add a document
export const addDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId)
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
}

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId)
  await deleteDoc(docRef)
}

// ── Dashboard Specific ───────────────────────────────────

// Get count of any collection
export const getCount = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.size
}

// Get recent students (last 5 added)
export const getRecentStudents = async () => {
  const q = query(
    collection(db, 'students'),
    orderBy('createdAt', 'desc'),
    limit(5)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}