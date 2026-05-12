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
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase.config";

// ── Generic Helpers ──────────────────────────────────────

// Get all documents from a collection
export const getCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get a single document
export const getDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
};

// Add a document
export const addDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Update a document
export const updateDocument = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

// Delete a document
export const deleteDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

// ── Dashboard Specific ───────────────────────────────────

// Get count of any collection
export const getCount = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.size;
};

// Get recent students (last 5 added)
export const getRecentStudents = async () => {
  const q = query(
    collection(db, "students"),
    orderBy("createdAt", "desc"),
    limit(5),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Check if attendance already exists for a class on a specific date
export const getAttendanceByClassAndDate = async (className, date) => {
  const q = query(
    collection(db, "attendance"),
    where("class", "==", className),
    where("date", "==", date),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

// Get all attendance records for a specific class
export const getAttendanceByClass = async (className) => {
  try {
    const q = query(
      collection(db, "attendance"),
      where("class", "==", className),
    );
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sort in JavaScript instead of Firestore to avoid index requirement
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("getAttendanceByClass error:", error);
    throw error;
  }
};

// Get attendance records for a specific student
export const getAttendanceByStudent = async (studentId) => {
  const q = query(collection(db, "attendance"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Filter records that include this student
  return records.filter((record) =>
    record.records?.some((r) => r.studentId === studentId),
  );
};

// Get grades for a specific student
export const getGradesByStudent = async (studentId) => {
  const q = query(
    collection(db, "grades"),
    where("studentId", "==", studentId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get fees for a specific student
export const getFeesByStudent = async (studentId) => {
  const q = query(collection(db, "fees"), where("studentId", "==", studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get students by class
export const getStudentsByClass = async (className) => {
  try {
    console.log("Fetching students for class:", className); // ← add this
    if (!className) {
      console.warn("getStudentsByClass called with empty className");
      return [];
    }
    const q = query(
      collection(db, "students"),
      where("class", "==", className),
    );
    const snapshot = await getDocs(q);
    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Students found:", students.length); // ← add this
    return students;
  } catch (error) {
    console.error("getStudentsByClass error:", error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (messageData) => {
  const docRef = await addDoc(collection(db, "messages"), {
    ...messageData,
    status: "unread",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get messages for admin — all messages
export const getAdminMessages = async () => {
  try {
    const snapshot = await getDocs(collection(db, "messages"));
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Only show messages sent TO admin, not messages admin sent
    return all
      .filter((m) => m.recipientId === "admin")
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("getAdminMessages error:", error);
    throw error;
  }
};

export const getAdminSentMessages = async () => {
  try {
    const snapshot = await getDocs(collection(db, "messages"));
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return all
      .filter((m) => m.senderRole === "admin")
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("getAdminSentMessages error:", error);
    throw error;
  }
};

// Get messages sent by a specific student
export const getStudentMessages = async (studentId) => {
  try {
    const snapshot = await getDocs(collection(db, "messages"));
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return all
      .filter(
        (m) =>
          m.senderId === studentId || // student sent this
          m.recipientId === studentId, // someone sent this to student
      )
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("getStudentMessages error:", error);
    throw error;
  }
};

// Get messages for a teacher
export const getTeacherMessages = async (teacherId) => {
  try {
    const snapshot = await getDocs(collection(db, "messages"));
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return all
      .filter(
        (m) =>
          m.recipientId === teacherId || // sent to teacher
          (m.senderId === teacherId && m.senderRole === "teacher"), // sent by teacher
      )
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("getTeacherMessages error:", error);
    throw error;
  }
};
// Get replies for a message
export const getReplies = async (messageId) => {
  const q = query(
    collection(db, "messages", messageId, "replies"),
    orderBy("createdAt", "asc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Send a reply
export const sendReply = async (messageId, replyData) => {
  await addDoc(collection(db, "messages", messageId, "replies"), {
    ...replyData,
    createdAt: serverTimestamp(),
  });
  await updateDocument("messages", messageId, { status: "replied" });
};

// Mark message as read — clears from admin/teacher notification count
export const markAsRead = async (messageId) => {
  const docRef = doc(db, "messages", messageId);
  await updateDoc(docRef, { status: "read" });
};

// Batch mark all messages as read for a recipient
export const markAllAsRead = async (recipientId) => {
  try {
    const snapshot = await getDocs(collection(db, "messages"));
    const toMark = snapshot.docs.filter(
      (d) =>
        d.data().recipientId === recipientId && d.data().status === "unread",
    );
    if (toMark.length === 0) return;
    const batch = writeBatch(db);
    toMark.forEach((d) => {
      batch.update(doc(db, "messages", d.id), { status: "read" });
    });
    await batch.commit();
  } catch (error) {
    console.error("markAllAsRead error:", error);
  }
};

// Send announcement to a group
export const sendAnnouncement = async (announcementData) => {
  const docRef = await addDoc(collection(db, "announcements"), {
    ...announcementData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get all announcements
export const getAnnouncements = async () => {
  try {
    const snapshot = await getDocs(collection(db, "announcements"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("getAnnouncements error:", error);
    throw error;
  }
};

// Get announcements for a specific audience
export const getAnnouncementsForRole = async (role) => {
  try {
    const snapshot = await getDocs(collection(db, "announcements"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data
      .filter((a) => a.audience === "everyone" || a.audience === role)
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error("getAnnouncementsForRole error:", error);
    throw error;
  }
};
