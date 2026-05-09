import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getStudentsByClass } from '../../firebase/firestore'
import { MdSearch, MdPerson } from 'react-icons/md'

const MyClass = () => {
  const { teacher }   = useAuth()
  const navigate      = useNavigate()
  const [students, setStudents]   = useState([])
  const [filtered, setFiltered]   = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!teacher?.class) return
    const fetchStudents = async () => {
      try {
        const data = await getStudentsByClass(teacher.class)
        setStudents(data)
        setFiltered(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [teacher])

  useEffect(() => {
    const q       = search.toLowerCase()
    const results = students.filter(s =>
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    )
    setFiltered(results)
  }, [search, students])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading class...</p>
      </div>
    )
  }

  if (!teacher?.class) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">
          You have not been assigned a class yet. Contact admin.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Class — {teacher.class}</h2>
        <p className="text-sm text-gray-500 mt-1">{students.length} students enrolled</p>
      </div>

      {/* Search */}
      <div className="relative">
        <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Students Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <MdPerson size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {search ? 'No students match your search.' : 'No students in this class yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-bold text-lg flex items-center justify-center shrink-0">
                {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{student.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full capitalize">
                    {student.status}
                  </span>
                  {student.isSpecialCase && (
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                      Special
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyClass