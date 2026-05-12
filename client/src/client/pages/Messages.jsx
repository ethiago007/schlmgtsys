import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { MdSend, MdMessage, MdClose, MdCampaign } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import {
  sendMessage,
  getStudentMessages,
  getCollection,
  getAnnouncementsForRole,
} from '../../firebase/firestore'
import MessageThread from '../../shared/components/MessageThread'

const StudentMessages = () => {
  const { user, student }               = useAuth()
  const { markAnnouncementsAsSeen }     = useNotifications()
  const [messages, setMessages]         = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeMessage, setActiveMessage] = useState(null)
  const [showCompose, setShowCompose]   = useState(false)
  const [teachers, setTeachers]         = useState([])
  const [sending, setSending]           = useState(false)
  const [tab, setTab]                   = useState('inbox')
  const [form, setForm] = useState({
    subject:       '',
    message:       '',
    recipientId:   'admin',
    recipientRole: 'admin',
    recipientName: 'Admin',
  })

  const fetchMessages = async () => {
    if (!student) return
    try {
      const [msgs, announcs, teacherList] = await Promise.all([
        getStudentMessages(student.id),
        getAnnouncementsForRole('student'),
        getCollection('teachers'),
      ])
      setMessages(msgs)
      setAnnouncements(announcs)
      setTeachers(teacherList)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [student])

  // ← Key fix: call markAnnouncementsAsSeen AFTER
  // announcements are loaded and tab is switched
  const handleTabChange = (newTab) => {
    setTab(newTab)
    if (newTab === 'announcements') {
      // Small delay to ensure unseenAnnouncementIds
      // is populated in context before marking as seen
      setTimeout(() => {
        markAnnouncementsAsSeen()
      }, 500)
    }
  }

  const handleSend = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      return toast.error('Subject and message are required')
    }
    setSending(true)
    try {
      await sendMessage({
        ...form,
        senderId:   student.id,
        senderName: `${student.firstName} ${student.lastName}`,
        senderRole: 'student',
        message:    form.message.trim(),
        subject:    form.subject.trim(),
      })
      toast.success('Message sent!')
      setForm({
        subject: '', message: '',
        recipientId: 'admin', recipientRole: 'admin', recipientName: 'Admin',
      })
      setShowCompose(false)
      fetchMessages()
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  const statusColor = (status) => {
    const colors = {
      unread:  'bg-red-100 text-red-600',
      read:    'bg-gray-100 text-gray-500',
      replied: 'bg-green-100 text-green-600',
    }
    return colors[status] || 'bg-gray-100 text-gray-500'
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp)
    return date.toLocaleDateString('en-NG', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">{messages.length} conversations</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdSend size={16} />
          New Message
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => handleTabChange('inbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'inbox'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MdMessage size={16} />
          My Messages
        </button>
        <button
          onClick={() => handleTabChange('announcements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'announcements'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MdCampaign size={16} />
          Announcements
          {announcements.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {announcements.length}
            </span>
          )}
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
                      const value = e.target.value
                      if (value === 'admin') {
                        setForm(prev => ({
                          ...prev,
                          recipientId:   'admin',
                          recipientRole: 'admin',
                          recipientName: 'Admin',
                        }))
                      } else {
                        const t = teachers.find(t => t.id === value)
                        setForm(prev => ({
                          ...prev,
                          recipientId:   value,
                          recipientRole: 'teacher',
                          recipientName: t
                            ? `${t.firstName} ${t.lastName}`
                            : 'Teacher',
                        }))
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">School Admin</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.subject})
                      </option>
                    ))}
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
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="What is this about?"
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
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your message here..."
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Buttons */}
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inbox Tab */}
      {tab === 'inbox' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-10 text-center">
              <MdMessage size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No messages yet</p>
              <button
                onClick={() => setShowCompose(true)}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Send your first message
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map(message => {
                const isSentByMe = message.senderId === student?.id
                return (
                  <div
                    key={message.id}
                    onClick={() => setActiveMessage(message)}
                    className="flex items-start gap-4 p-5 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 ${
                      isSentByMe
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {isSentByMe
                        ? (message.recipientName?.charAt(0) || 'A')
                        : message.senderName?.charAt(0)
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">
                        {isSentByMe
                          ? `To: ${message.recipientName || message.recipientRole}`
                          : `From: ${message.senderName}`
                        }
                      </p>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {formatTime(message.createdAt)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(message.status)}`}>
                        {isSentByMe
                          ? (message.status === 'replied' ? 'replied' : 'sent')
                          : message.status
                        }
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Announcements Tab */}
      {tab === 'announcements' && (
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
              {announcements.map(a => (
                <div key={a.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <MdCampaign size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {a.subject}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        From Admin · {a.createdAt?.seconds
                          ? new Date(a.createdAt.seconds * 1000).toLocaleDateString('en-NG', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : ''
                        }
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
            currentRole="student"
            onClose={() => {
              setActiveMessage(null)
              fetchMessages()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default StudentMessages