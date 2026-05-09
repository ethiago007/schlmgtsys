import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getStudentsByClass, getGradesByStudent, getCollection } from '../../firebase/firestore'
import { gradeColor } from '../../utils/constant'
import {
  MdPeople,
  MdGrade,
  MdEventNote,
  MdMessage,
} from 'react-icons/md'

const TeacherHome = () => {
  const { teacher }   = useAuth()
  const navigate      = useNavigate()
  const [students, setStudents]       = useState([])
  const [recentGrades, setRecentGrades] = useState([])
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!teacher) return
    const fetchData = async () => {
      try {
        // Get students in teacher's class
        const classStudents = await getStudentsByClass(teacher.class || '')
        setStudents(classStudents)

        // Get recent grades recorded by this teacher
        const allGrades   = await getCollection('grades')
        const myGrades    = allGrades
          .filter(g => g.subject === teacher.subject)
          .slice(0, 5)
        setRecentGrades(myGrades)

        // Check if attendance marked today
        const today  = new Date().toISOString().split('T')[0]
        const allAtt = await getCollection('attendance')
        const todayRecord = allAtt.find(
          a => a.date === today && a.class === teacher.class
        )
        setTodayAttendance(todayRecord || null)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [teacher])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">
          Teacher record not found. Contact admin.
        </p>
      </div>
    )
  }

  const quickCards = [
    {
      label: 'My Students',
      icon:  <MdPeople size={24} />,
      color: 'bg-green-500',
      value: students.length,
      path:  '/teacher/class',
    },
    {
      label: 'Grades Recorded',
      icon:  <MdGrade size={24} />,
      color: 'bg-blue-500',
      value: recentGrades.length,
      path:  '/teacher/grades',
    },
    {
      label: "Today's Attendance",
      icon:  <MdEventNote size={24} />,
      color: todayAttendance ? 'bg-green-500' : 'bg-yellow-500',
      value: todayAttendance ? 'Marked ✓' : 'Not yet',
      path:  '/teacher/attendance',
    },
  ]

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white"
      >
        <p className="text-green-200 text-sm">Welcome back 👋</p>
        <h2 className="text-2xl font-bold mt-1">
          {teacher.firstName} {teacher.lastName}
        </h2>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
            {teacher.subject}
          </span>
          {teacher.class && (
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              Class: {teacher.class}
            </span>
          )}
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
            {teacher.qualification}
          </span>
        </div>
      </motion.div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div className={`w-12 h-12 rounded-xl ${card.color} text-white flex items-center justify-center`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Grades</h3>
            <button
              onClick={() => navigate('/teacher/grades')}
              className="text-sm text-green-600 hover:underline"
            >
              View all
            </button>
          </div>
          {recentGrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No grades recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentGrades.map(g => (
                <div key={g.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{g.studentName}</p>
                    <p className="text-xs text-gray-400">{g.subject} · {g.term}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{g.total}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(g.grade)}`}>
                      {g.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Mark Attendance',  path: '/teacher/attendance', color: 'bg-green-600' },
              { label: 'Record Grade',     path: '/teacher/grades',     color: 'bg-blue-600' },
              { label: 'View My Class',    path: '/teacher/class',      color: 'bg-purple-600' },
              { label: 'Check Messages',   path: '/teacher/messages',   color: 'bg-yellow-600' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`w-full text-left px-4 py-3 rounded-xl text-white text-sm font-medium ${action.color} hover:opacity-90 transition`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default TeacherHome