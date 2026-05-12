const admin = require('firebase-admin')

// The private key needs \n converted to actual line breaks
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined

if (!privateKey) {
  throw new Error('FIREBASE_PRIVATE_KEY is missing from environment variables')
}

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID is missing from environment variables')
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('FIREBASE_CLIENT_EMAIL is missing from environment variables')
}

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
})

const db   = admin.firestore()
const auth = admin.auth()

module.exports = { admin, db, auth }