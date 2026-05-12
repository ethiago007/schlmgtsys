import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReplies, sendReply, markAsRead } from "../../firebase/firestore";
import { MdSend, MdClose, MdPerson } from "react-icons/md";
import toast from "react-hot-toast";

const MessageThread = ({ message, currentUser, currentRole, onClose }) => {
  const [replies, setReplies] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const data = await getReplies(message.id);
        setReplies(data);
        // Mark as read when opened
        if (message.status === "unread") {
          await markAsRead(message.id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReplies();
  }, [message.id]);

  // Scroll to bottom when replies load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await sendReply(message.id, {
        message: reply.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentRole,
        senderRole: currentRole,
      });
      setReply("");
      // Refresh replies
      const updated = await getReplies(message.id);
      setReplies(updated);
      toast.success("Reply sent!");
    } catch (error) {
      toast.error("Failed to send reply");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roleColor = (role) => {
    const colors = {
      admin: "bg-blue-100 text-blue-700",
      teacher: "bg-green-100 text-green-700",
      student: "bg-purple-100 text-purple-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 truncate">
              {message.subject}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor(message.senderRole)}`}
              >
                {message.senderRole}
              </span>
              <span className="text-xs text-gray-400">
                {message.senderName} · {formatTime(message.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition ml-4 shrink-0"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Original Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm flex items-center justify-center shrink-0">
              {message.senderName?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4">
                <p className="text-sm text-gray-800">{message.message}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>

          {/* Replies */}
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Loading replies...
            </p>
          ) : (
            replies.map((r) => {
              const isMe =
                r.senderId === currentUser?.uid || r.senderRole === currentRole;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shrink-0 ${roleColor(r.senderRole)}`}
                  >
                    {r.senderName?.charAt(0)}
                  </div>
                  <div
                    className={`flex-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div
                      className={`rounded-2xl p-4 max-w-xs sm:max-w-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-gray-50 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm">{r.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 mx-1">
                      {r.senderName} · {formatTime(r.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3 items-end">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your reply... (Enter to send)"
              rows={2}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition disabled:opacity-50 shrink-0"
            >
              <MdSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageThread;
