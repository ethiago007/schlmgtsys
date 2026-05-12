import { getCollection, updateDocument } from '../firebase/firestore'

export const migrateMessages = async () => {
  const [messages, students, teachers] = await Promise.all([
    getCollection('messages'),
    getCollection('students'),
    getCollection('teachers'),
  ])

  let updated = 0

  for (const message of messages) {
    // Skip if already has recipientName
    if (message.recipientName) continue

    let recipientName = null

    if (message.recipientId === 'admin') {
      recipientName = 'Admin'
    } else {
      // Check students
      const student = students.find(s => s.id === message.recipientId)
      if (student) {
        recipientName = `${student.firstName} ${student.lastName}`
      }

      // Check teachers
      const teacher = teachers.find(t => t.id === message.recipientId)
      if (teacher) {
        recipientName = `${teacher.firstName} ${teacher.lastName}`
      }
    }

    if (recipientName) {
      await updateDocument('messages', message.id, { recipientName })
      console.log(`Updated message ${message.id} → ${recipientName}`)
      updated++
    }
  }

  console.log(`Done — ${updated} messages updated`)
}