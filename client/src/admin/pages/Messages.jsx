import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  MdMessage,
  MdDelete,
  MdSearch,
  MdClose,
  MdSend,
  MdCampaign,
  MdPerson,
} from "react-icons/md";
import {
  getAdminMessages,
  deleteDocument,
  getCollection,
  sendMessage,
  sendAnnouncement,
  getAnnouncements,
  getAdminSentMessages,
} from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import MessageThread from "../../shared/components/MessageThread";
import DeleteModal from "../../shared/components/DeleteModal";
import { markAllAsRead } from "../../firebase/firestore";
import { SkeletonMessage } from "../../shared/components/Skeleton";

const fetchAll = async () => {
  setLoading(true);
  try {
    const [msgs, sent, announcs, studs, teachs] = await Promise.all([
      getAdminMessages(),
      getAdminSentMessages(),
      getAnnouncements(),
      getCollection("students"),
      getCollection("teachers"),
    ]);
    setMessages(msgs);
    setSentMessages(sent);
    setAnnouncements(announcs);
    setStudents(studs);
    setTeachers(teachs);
  } catch (error) {
    toast.error("Failed to load messages");
    console.error(error);
  } finally {
    setLoading(false);
  }
};
const statusColor = (status) => {
  const colors = {
    unread: "bg-red-100 text-red-600",
    read: "bg-gray-100 text-gray-500",
    replied: "bg-green-100 text-green-600",
  };
  return colors[status] || "bg-gray-100 text-gray-500";
};

const audienceColor = (audience) => {
  const colors = {
    everyone: "bg-blue-100 text-blue-700",
    student: "bg-purple-100 text-purple-700",
    teacher: "bg-green-100 text-green-700",
  };
  return colors[audience] || "bg-gray-100 text-gray-700";
};

// Compose Modal Component
const ComposeModal = ({ onClose, onSent, students, teachers, adminUser }) => {
  const [mode, setMode] = useState("direct"); // 'direct' | 'announcement'
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    recipientId: "",
    recipientRole: "student",
    subject: "",
    message: "",
    audience: "everyone", // for announcements
  });

  // Inside ComposeModal — update handleSend to include recipientName
  const handleSend = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      return toast.error("Subject and message are required");
    }
    if (mode === "direct" && !form.recipientId) {
      return toast.error("Please select a recipient");
    }

    setSending(true);
    try {
      if (mode === "announcement") {
        await sendAnnouncement({
          subject: form.subject.trim(),
          message: form.message.trim(),
          audience: form.audience,
          senderName: "Admin",
          senderRole: "admin",
          senderId: adminUser?.uid,
        });
        toast.success("Announcement sent!");
      } else {
        // Build recipient name from the dropdown selection
        let recipientName = "Unknown";

        if (form.recipientRole === "student") {
          const student = students.find((s) => s.id === form.recipientId);
          if (student)
            recipientName = `${student.firstName} ${student.lastName}`;
        } else if (form.recipientRole === "teacher") {
          const teacher = teachers.find((t) => t.id === form.recipientId);
          if (teacher)
            recipientName = `${teacher.firstName} ${teacher.lastName}`;
        }

        console.log("recipientName resolved:", recipientName); // ← temp log

        await sendMessage({
          subject: form.subject.trim(),
          message: form.message.trim(),
          recipientId: form.recipientId,
          recipientRole: form.recipientRole,
          recipientName,
          senderId: adminUser?.uid,
          senderName: "Admin",
          senderRole: "admin",
        });
        toast.success(`Message sent to ${recipientName}!`);
      }
      onSent();
      onClose();
    } catch (error) {
      toast.error("Failed to send");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const allRecipients = [
    ...students.map((s) => ({
      id: s.id,
      label: `${s.firstName} ${s.lastName} (Student · ${s.class})`,
      role: "student",
    })),
    ...teachers.map((t) => ({
      id: t.id,
      label: `${t.firstName} ${t.lastName} (Teacher · ${t.subject})`,
      role: "teacher",
    })),
  ];

  return (
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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800">New Message</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setMode("direct")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              mode === "direct"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdPerson size={16} />
            Direct Message
          </button>
          <button
            onClick={() => setMode("announcement")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              mode === "announcement"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdCampaign size={16} />
            Announcement
          </button>
        </div>

        <div className="space-y-4">
          {/* Direct Message — Recipient */}
          {mode === "direct" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send To
              </label>
              <select
                value={form.recipientId}
                onChange={(e) => {
                  const selectedId = e.target.value;

                  // Check if it's a student
                  const student = students.find((s) => s.id === selectedId);
                  if (student) {
                    setForm((prev) => ({
                      ...prev,
                      recipientId: selectedId,
                      recipientRole: "student",
                      recipientName: `${student.firstName} ${student.lastName}`,
                    }));
                    return;
                  }

                  // Check if it's a teacher
                  const teacher = teachers.find((t) => t.id === selectedId);
                  if (teacher) {
                    setForm((prev) => ({
                      ...prev,
                      recipientId: selectedId,
                      recipientRole: "teacher",
                      recipientName: `${teacher.firstName} ${teacher.lastName}`,
                    }));
                    return;
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select recipient</option>
                <optgroup label="Students">
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} · {s.class}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Teachers">
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} · {t.subject}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Announcement — Audience */}
          {mode === "announcement" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send To
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "everyone", label: "👥 Everyone" },
                  { value: "student", label: "🎒 Students" },
                  { value: "teacher", label: "📚 Teachers" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, audience: opt.value }))
                    }
                    className={`py-2.5 rounded-lg text-sm font-medium border transition ${
                      form.audience === opt.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              placeholder={
                mode === "announcement"
                  ? "Announcement title..."
                  : "What is this about?"
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="Write your message here..."
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <MdSend size={16} />
              {sending
                ? "Sending..."
                : mode === "announcement"
                  ? "Send Announcement"
                  : "Send Message"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Component
const AdminMessages = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("inbox"); // 'inbox' | 'announcements'
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [deletingId, setDeletingId] = useState(null);
  const [deleteCollection, setDeleteCollection] = useState("messages");
  const deleteIdRef = useRef(null);
  const [sentMessages, setSentMessages] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [msgs, sent, announcs, studs, teachs] = await Promise.all([
        getAdminMessages(),
        getAdminSentMessages(),
        getAnnouncements(),
        getCollection("students"),
        getCollection("teachers"),
      ]);
      setMessages(msgs);
      setSentMessages(sent);
      setAnnouncements(announcs);
      setStudents(studs);
      setTeachers(teachs);
    } catch (error) {
      toast.error("Failed to load messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filter messages
  useEffect(() => {
    let results = tab === "inbox" ? messages : announcements;
    if (statusFilter && tab === "inbox") {
      results = results.filter((m) => m.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (m) =>
          m.subject?.toLowerCase().includes(q) ||
          m.senderName?.toLowerCase().includes(q) ||
          m.message?.toLowerCase().includes(q),
      );
    }
    setFiltered(results);
  }, [search, statusFilter, messages, announcements, tab]);

  const confirmDelete = (id, collectionName) => {
    deleteIdRef.current = id;
    setDeleteCollection(collectionName);
    setDeleteModal({ open: true, id });
  };

  const handleDelete = async () => {
    const id = deleteIdRef.current;
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteDocument(deleteCollection, id);
      toast.success("Deleted successfully");
      setDeleteModal({ open: false, id: null });
      deleteIdRef.current = null;
      fetchAll();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

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

  const tabs = [
    {
      id: "inbox",
      label: "Inbox",
      icon: <MdMessage size={16} />,
      count: unreadCount,
    },
    {
      id: "sent",
      label: "Sent",
      icon: <MdSend size={16} />,
      count: sentMessages.length,
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: <MdCampaign size={16} />,
      count: announcements.length,
    },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">
            {messages.length} messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdSend size={16} />
          Compose
        </button>
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
        {[
          {
            id: "inbox",
            label: "Inbox",
            icon: <MdMessage size={16} />,
            badge: unreadCount,
            badgeColor: "bg-red-500",
          },
          {
            id: "sent",
            label: "Sent",
            icon: <MdSend size={16} />,
            badge: sentMessages.length,
            badgeColor: "bg-gray-400",
          },
          {
            id: "announcements",
            label: "Announcements",
            icon: <MdCampaign size={16} />,
            badge: announcements.length,
            badgeColor: "bg-blue-500",
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.label}
            {t.badge > 0 && (
              <span
                className={`${t.badgeColor} text-white text-xs px-1.5 py-0.5 rounded-full`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters — only for inbox */}
      {tab === "inbox" && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <MdSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      )}

      {/* Search for announcements */}
      {tab === "announcements" && (
        <div className="relative">
          <MdSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonMessage key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            {tab === "inbox" ? (
              <MdMessage size={40} className="text-gray-300 mx-auto mb-3" />
            ) : (
              <MdCampaign size={40} className="text-gray-300 mx-auto mb-3" />
            )}
            <p className="text-gray-400 text-sm">
              {search || statusFilter
                ? "No results match your filters."
                : tab === "inbox"
                  ? "No messages yet."
                  : "No announcements sent yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Inbox Messages */}
            {tab === "inbox" &&
              filtered.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 p-5 hover:bg-gray-50 transition cursor-pointer ${
                    message.status === "unread" ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => setActiveMessage(message)}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold text-sm flex items-center justify-center shrink-0">
                    {message.senderName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-semibold text-gray-800 ${
                          message.status === "unread" ? "font-bold" : ""
                        }`}
                      >
                        {message.senderName}
                      </p>
                      <span className="text-xs text-gray-400 capitalize">
                        ({message.senderRole})
                      </span>
                      {message.status === "unread" && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p
                      className={`text-sm mt-0.5 truncate ${
                        message.status === "unread"
                          ? "text-gray-800 font-medium"
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
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(message.status)}`}
                    >
                      {message.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(message.id, "messages");
                      }}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))}

            {/* Announcements */}
            {tab === "announcements" &&
              filtered.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start gap-4 p-5 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <MdCampaign size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">
                        {announcement.subject}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${audienceColor(announcement.audience)}`}
                      >
                        {announcement.audience}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {announcement.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(announcement.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(announcement.id, "announcements");
                    }}
                    className="text-red-400 hover:text-red-600 transition shrink-0"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}

            {/* Sent Messages Tab */}
            {/* Sent Messages Tab */}
            {tab === "sent" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {sentMessages.length === 0 ? (
                  <div className="p-10 text-center">
                    <MdSend size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      No sent messages yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-4 p-5 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => setActiveMessage(message)}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                          {/* Use recipientName, fall back to recipientRole display */}
                          {(
                            message.recipientName ||
                            message.recipientRole ||
                            "?"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800">
                              To:{" "}
                              {message.recipientName ||
                                (message.recipientId === "admin"
                                  ? "Admin"
                                  : null) ||
                                `${message.recipientRole || "Unknown"}`}
                            </p>
                            <span className="text-xs text-gray-400 capitalize">
                              ({message.recipientRole})
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-0.5">
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            onClose={() => setShowCompose(false)}
            onSent={fetchAll}
            students={students}
            teachers={teachers}
            adminUser={user}
          />
        )}
      </AnimatePresence>

      {/* Message Thread */}
      <AnimatePresence>
        {activeMessage && (
          <MessageThread
            message={activeMessage}
            currentUser={user}
            currentRole="admin"
            onClose={() => {
              setActiveMessage(null);
              fetchAll();
            }}
          />
        )}
      </AnimatePresence>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deletingId === deleteModal.id}
        title="Delete this item?"
        message="This will permanently remove it and cannot be undone."
      />
    </div>
  );
};

export default AdminMessages;
