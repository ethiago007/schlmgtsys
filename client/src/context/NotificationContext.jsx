import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, role, student, teacher } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [unseenAnnouncementIds, setUnseenAnnouncementIds] = useState([]);
  const unseenIdsRef = useRef([])

  useEffect(() => {
    if (!user || !role) return;
    const unsubs = [];

    // ── Admin — messages sent TO admin ──────────────────
    if (role === "admin") {
      const q = query(
        collection(db, "messages"),
        where("recipientId", "==", "admin"),
        where("status", "==", "unread"),
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          setUnreadMessages(snapshot.size);
        },
        (error) => {
          // Fallback if index not ready — filter in JS
          console.warn("Admin listener index issue, using fallback", error);
          const fallback = onSnapshot(collection(db, "messages"), (snap) => {
            const count = snap.docs.filter(
              (d) =>
                d.data().recipientId === "admin" &&
                d.data().status === "unread",
            ).length;
            setUnreadMessages(count);
          });
          unsubs.push(fallback);
        },
      );
      unsubs.push(unsub);
    }

    // ── Teacher — messages sent TO this teacher ──────────
    if (role === "teacher" && teacher?.id) {
      const unsub = onSnapshot(
        collection(db, "messages"),
        (snapshot) => {
          const count = snapshot.docs.filter((d) => {
            const data = d.data();
            return data.recipientId === teacher.id && data.status === "unread";
          }).length;
          setUnreadMessages(count);
        },
        (error) => console.error("Teacher message listener:", error),
      );
      unsubs.push(unsub);

      // Announcements
      const annUnsub = onSnapshot(
        collection(db, "announcements"),
        (snapshot) => {
          const ids = snapshot.docs
            .filter((d) => {
              const audience = d.data().audience?.toLowerCase().trim();
              return audience === "everyone" || audience === "teacher";
            })
            .map((d) => d.id);
          const seen = JSON.parse(
            localStorage.getItem(`seen_ann_${teacher.id}`) || "[]",
          );
          const unseen = ids.filter((id) => !seen.includes(id));
          setUnreadAnnouncements(unseen.length);
          setUnseenAnnouncementIds(unseen)
unseenIdsRef.current = unseen
        },
      );
      unsubs.push(annUnsub);
    }

    // ── Student — messages sent TO this student ──────────
    if (role === "student" && student?.id) {
      const unsub = onSnapshot(
        collection(db, "messages"),
        (snapshot) => {
          const count = snapshot.docs.filter((d) => {
            const data = d.data();
            // Student sees unread when admin/teacher replies to them
            return data.recipientId === student.id && data.status === "unread";
          }).length;
          setUnreadMessages(count);
        },
        (error) => console.error("Student message listener:", error),
      );
      unsubs.push(unsub);

      // Announcements
      const annUnsub = onSnapshot(
        collection(db, "announcements"),
        (snapshot) => {
          const ids = snapshot.docs
            .filter((d) => {
              const audience = d.data().audience?.toLowerCase().trim();
              return audience === "everyone" || audience === "student";
            })
            .map((d) => d.id);
          const seen = JSON.parse(
            localStorage.getItem(`seen_ann_${student.id}`) || "[]",
          );
          const unseen = ids.filter((id) => !seen.includes(id));
          setUnreadAnnouncements(unseen.length);
          setUnseenAnnouncementIds(unseen);
        },
      );
      unsubs.push(annUnsub);
    }

    return () => unsubs.forEach((unsub) => unsub());
  }, [user, role, student, teacher]);

  const markAnnouncementsAsSeen = () => {
    const userId = student?.id || teacher?.id;
    if (!userId || unseenAnnouncementIds.length === 0) return;
    const key = `seen_ann_${userId}`;
    const seen = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [...new Set([...seen, ...unseenAnnouncementIds])];
    localStorage.setItem(key, JSON.stringify(updated));
    setUnreadAnnouncements(0);
    setUnseenAnnouncementIds([]);
  };

  const totalUnread = unreadMessages + unreadAnnouncements;

  return (
    <NotificationContext.Provider
      value={{
        unreadMessages,
        unreadAnnouncements,
        totalUnread,
        markAnnouncementsAsSeen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};



export const useNotifications = () => useContext(NotificationContext);
