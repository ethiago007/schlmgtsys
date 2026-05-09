import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getCollection } from '../../firebase/firestore'
import { MdCheckCircle, MdCancel } from 'react-icons/md'

const MyAttendance = () => {
  const { student } = useAuth()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ present: 0, absent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!student) return
    const fetchData = async () => {
      try {
        const allAttendance = await getCollection('attendance')
        const myRecords     = []
        let present = 0, absent = 0

        allAttendance.forEach(record => {
          const myEntry = record.records?.find(r => r.studentId === student.id)
          if (myEntry) {
            myRecords.push({
              date:   record.date,
              class:  record.class,
              status: myEntry.status,
            })
            if (myEntry.status === 'present') present++
            else absent++
          }
        })

        myRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
        setRecords(myRecords)
        setSummary({ present, absent })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [student])

  const total = summary.present + summary.absent
  const rate  = total > 0 ? Math.round((summary.present / total) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading attendance...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">Your daily attendance record</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Attendance Rate',
            value: `${rate}%`,
            color: rate >= 75 ? 'text-green-600' : 'text-red-500',
            note:  rate < 75 ? 'Below 75% threshold' : null,
          },
          { label: 'Days Present', value: summary.present, color: 'text-green-600' },
          { label: 'Days Absent',  value: summary.absent,  color: 'text-red-500' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-5 text-center"
          >
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            {card.note && <p className="text-xs text-red-400 mt-1">{card.note}</p>}
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Overall Attendance</p>
          <p className={`text-sm font-bold ${rate >= 75 ? 'text-green-600' : 'text-red-500'}`}>
            {rate}%
          </p>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`h-full rounded-full ${rate >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-xs text-gray-400">0%</p>
          <p className="text-xs text-gray-400">Minimum: 75%</p>
          <p className="text-xs text-gray-400">100%</p>
        </div>
      </motion.div>

      {/* Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Daily Records</h3>
        </div>
        {records.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No attendance records yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Class</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{record.date}</td>
                    <td className="px-6 py-4 text-gray-600">{record.class}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {record.status === 'present'
                          ? <MdCheckCircle className="text-green-500" size={16} />
                          : <MdCancel className="text-red-500" size={16} />
                        }
                        <span className={`text-xs font-semibold capitalize ${
                          record.status === 'present' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MyAttendance