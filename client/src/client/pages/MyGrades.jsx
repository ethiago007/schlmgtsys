import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getGradesByStudent } from '../../firebase/firestore'
import { gradeColor, terms, sessions } from '../../utils/constants'
import { MdGrade } from 'react-icons/md'

const MyGrades = () => {
  const { student }   = useAuth()
  const [grades, setGrades]             = useState([])
  const [filtered, setFiltered]         = useState([])
  const [termFilter, setTermFilter]     = useState('')
  const [sessionFilter, setSessionFilter] = useState('')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!student) return
    const fetchData = async () => {
      try {
        const myGrades = await getGradesByStudent(student.id)
        setGrades(myGrades)
        setFiltered(myGrades)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [student])

  useEffect(() => {
    let results = grades
    if (termFilter)    results = results.filter(g => g.term === termFilter)
    if (sessionFilter) results = results.filter(g => g.session === sessionFilter)
    setFiltered(results)
  }, [termFilter, sessionFilter, grades])

  const summary = (() => {
    if (filtered.length === 0) return null
    const avg          = Math.round(filtered.reduce((s, g) => s + g.total, 0) / filtered.length)
    const overallGrade  = avg >= 70 ? 'A' : avg >= 60 ? 'B' : avg >= 50 ? 'C' : avg >= 45 ? 'D' : avg >= 40 ? 'E' : 'F'
    const overallRemark = avg >= 70 ? 'Excellent' : avg >= 60 ? 'Very Good' : avg >= 50 ? 'Good' : avg >= 45 ? 'Pass' : avg >= 40 ? 'Poor' : 'Fail'
    return { avg, overallGrade, overallRemark, total: filtered.length }
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading your grades...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Grades</h2>
        <p className="text-sm text-gray-500 mt-1">Your academic performance records</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Terms</option>
          {terms.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sessions</option>
          {sessions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(termFilter || sessionFilter) && (
          <button
            onClick={() => { setTermFilter(''); setSessionFilter('') }}
            className="text-sm text-red-400 hover:text-red-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Subjects', value: summary.total, color: 'text-gray-800' },
            { label: 'Average Score', value: `${summary.avg}%`, color: 'text-blue-600' },
            {
              label: 'Overall Grade',
              value: `${summary.overallGrade} — ${summary.overallRemark}`,
              color: summary.overallGrade === 'A' ? 'text-green-600' : summary.overallGrade === 'F' ? 'text-red-600' : 'text-yellow-600'
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-5 text-center"
            >
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <MdGrade size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {termFilter || sessionFilter ? 'No grades for selected filters.' : 'No grades recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Subject</th>
                  <th className="px-6 py-4 text-left">C. Test</th>
                  <th className="px-6 py-4 text-left">Mid Term</th>
                  <th className="px-6 py-4 text-left">Exam</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Grade</th>
                  <th className="px-6 py-4 text-left">Remark</th>
                  <th className="px-6 py-4 text-left">Term</th>
                  <th className="px-6 py-4 text-left">Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((g, index) => (
                  <tr key={g.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{g.subject}</td>
                    <td className="px-6 py-4 text-gray-600">{g.classTest}</td>
                    <td className="px-6 py-4 text-gray-600">{g.midTerm}</td>
                    <td className="px-6 py-4 text-gray-600">{g.exam}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{g.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${gradeColor(g.grade)}`}>
                        {g.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{g.remark}</td>
                    <td className="px-6 py-4 text-gray-600">{g.term}</td>
                    <td className="px-6 py-4 text-gray-600">{g.session}</td>
                  </tr>
                ))}
              </tbody>
              {summary && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Average ({summary.total} subjects)
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{summary.avg}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${gradeColor(summary.overallGrade)}`}>
                        {summary.overallGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{summary.overallRemark}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MyGrades