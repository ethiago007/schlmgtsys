import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdPeople,
  MdSchool,
  MdClass,
  MdAttachMoney,
  MdPersonAdd,
  MdBarChart,
} from 'react-icons/md'
import StatCard from '../components/StatCard'
import { getCount, getRecentStudents } from '../../firebase/firestore'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    students: null,
    teachers: null,
    classes: null,
    fees: null,
  })
  const [recentStudents, setRecentStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, teachers, classes] = await Promise.all([
          getCount('students'),
          getCount('teachers'),
          getCount('classes'),
        ])
        setStats({ students, teachers, classes, fees: 0 })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const fetchRecentStudents = async () => {
      try {
        const data = await getRecentStudents()
        setRecentStudents(data)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoadingStudents(false)
      }
    }

    fetchStats()
    fetchRecentStudents()
  }, [])

  const statCards = [
    { label: 'Total Students',  value: stats.students, icon: <MdPeople />,       color: 'bg-blue-500',   delay: 0 },
    { label: 'Total Teachers',  value: stats.teachers, icon: <MdSchool />,       color: 'bg-green-500',  delay: 0.1 },
    { label: 'Total Classes',   value: stats.classes,  icon: <MdClass />,        color: 'bg-purple-500', delay: 0.2 },
    { label: 'Fees Collected',  value: stats.fees,     icon: '₦',  color: 'bg-yellow-500', delay: 0.3 },
  ]

  const quickActions = [
    { label: 'Add Student',  icon: <MdPersonAdd size={20} />,  path: '/admin/students/add',  color: 'bg-blue-600' },
    { label: 'Add Teacher',  icon: <MdSchool size={20} />,     path: '/admin/teachers',      color: 'bg-green-600' },
    { label: 'View Reports', icon: <MdBarChart size={20} />,   path: '/admin/grades',        color: 'bg-purple-600' },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening in your school today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Students</h3>
            <button
              onClick={() => navigate('/admin/students')}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>

          {loadingStudents ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : recentStudents.length === 0 ? (
            <p className="text-sm text-gray-400">No students added yet.</p>
          ) : (
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex items-center justify-center">
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{student.class} · {student.email}</p>
                  </div>

                  {/* Status */}
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium transition hover:opacity-90 ${action.color}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          {/* Small tip */}
          <div className="mt-6 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 font-medium">💡 Tip</p>
            <p className="text-xs text-blue-500 mt-1">
              Use the sidebar to navigate between sections. Add students first before assigning classes.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default Dashboard