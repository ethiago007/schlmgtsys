import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdMessage, MdCampaign, MdSend, MdClose } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import {
  getTeacherMessages,
  getAnnouncementsForRole,
  markAllAsRead,
  sendMessage,
  getStudentsByClass,
} from "../../firebase/firestore";
import { useNotifications } from "../../context/NotificationContext";
import MessageThread from "../../shared/components/MessageThread";
import { SkeletonTable } from "../../shared/components/Skeleton";
import { SkeletonMessage } from "../../shared/components/Skeleton";

const TeacherMessages = () => {
  const { user, teacher } = useAuth();
  const { markAnnouncementsAsSeen } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("inbox");
  const [activeMessage, setActiveMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [students, setStudents] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    recipientId: "admin",
    recipientRole: "admin",
    recipientName: "Admin",
    subject: "",
    message: "",
  });

  const fetchMessages = async () => {
    if (!teacher) return;
    try {
      const [msgs, announcs, classStudents] = await Promise.all([
        getTeacherMessages(teacher.id),
        getAnnouncementsForRole("teacher"),
        getStudentsByClass(teacher.class || ""),
      ]);
      setMessages(msgs);
      setAnnouncements(announcs);
      setStudents(classStudents);
      if (msgs.length > 0) {
        await markAllAsRead(teacher.id);
      }
    } catch (error) {
      console.error("fetchMessages error:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher) fetchMessages();
  }, [teacher]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "announcements") markAnnouncementsAsSeen();
  };

  const handleSend = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      return toast.error("Subject and message are required");
    }
    setSending(true);
    try {
      await sendMessage({
        subject: form.subject.trim(),
        message: form.message.trim(),
        recipientId: form.recipientId,
        recipientRole: form.recipientRole,
        recipientName: form.recipientName,
        senderId: teacher.id,
        senderName: `${teacher.firstName} ${teacher.lastName}`,
        senderRole: "teacher",
      });
      toast.success("Message sent!");
      setForm({
        recipientId: "admin",
        recipientRole: "admin",
        recipientName: "Admin",
        subject: "",
        message: "",
      });
      setShowCompose(false);
      fetchMessages();
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = messages.filter(
    (m) => m.recipientId === teacher?.id && m.status === "unread",
  ).length;

  const statusColor = (status) => {
    const colors = {
      unread: "bg-red-100 text-red-600",
      read: "bg-gray-100 text-gray-500",
      replied: "bg-green-100 text-green-600",
    };
    return colors[status] || "bg-gray-100 text-gray-500";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonMessage key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdSend size={16} />
          New Message
        </button>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800">New Message</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose size={22} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send To
                  </label>
                  <select
                    value={form.recipientId}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "admin") {
                        setForm((prev) => ({
                          ...prev,
                          recipientId: "admin",
                          recipientRole: "admin",
                          recipientName: "Admin",
                        }));
                      } else {
                        const s = students.find((st) => st.id === value);
                        setForm((prev) => ({
                          ...prev,
                          recipientId: value,
                          recipientRole: "student",
                          recipientName: s
                            ? `${s.firstName} ${s.lastName}`
                            : "Student",
                        }));
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="admin">School Admin</option>
                    {students.length > 0 && (
                      <optgroup label="My Students">
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="What is this about?"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Write your message..."
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <MdSend size={16} />
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          {
            id: "inbox",
            label: "Inbox",
            icon: <MdMessage size={16} />,
            badge: unreadCount,
          },
          {
            id: "announcements",
            label: "Announcements",
            icon: <MdCampaign size={16} />,
            badge: 0,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.label}
            {t.badge > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inbox */}
      {tab === "inbox" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          {messages.length === 0 ? (
            <div className="p-10 text-center">
              <MdMessage size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message) => {
                const isReceived = message.recipientId === teacher?.id;
                return (
                  <div
                    key={message.id}
                    onClick={() => setActiveMessage(message)}
                    className={`flex items-start gap-4 p-5 hover:bg-gray-50 transition cursor-pointer ${
                      isReceived && message.status === "unread"
                        ? "bg-green-50/30"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${
                        isReceived
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {isReceived
                        ? message.senderName?.charAt(0)
                        : message.recipientName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">
                          {isReceived
                            ? `From: ${message.senderName}`
                            : `To: ${message.recipientName || message.recipientId}`}
                        </p>
                        {isReceived && message.status === "unread" && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <p
                        className={`text-sm mt-0.5 truncate ${
                          isReceived && message.status === "unread"
                            ? "text-gray-800 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-xs text-gray-400">
                        {formatTime(message.createdAt)}
                      </p>
                      {isReceived && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(message.status)}`}
                        >
                          {message.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Announcements */}
      {tab === "announcements" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          {announcements.length === 0 ? (
            <div className="p-10 text-center">
              <MdCampaign size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No announcements yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {announcements.map((a) => (
                <div key={a.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <MdCampaign size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {a.subject}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        From Admin ·{" "}
                        {a.createdAt?.seconds
                          ? new Date(
                              a.createdAt.seconds * 1000,
                            ).toLocaleDateString("en-NG", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Thread Modal */}
      <AnimatePresence>
        {activeMessage && (
          <MessageThread
            message={activeMessage}
            currentUser={user}
            currentRole="teacher"
            onClose={() => {
              setActiveMessage(null);
              fetchMessages();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherMessages;
