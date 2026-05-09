const admin = require('firebase-admin')

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key comes as a string with \n — we need to convert them to real line breaks
    privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
})

const db   = admin.firestore()
const auth = admin.auth()

module.exports = { admin, db, auth }