import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getFeesByStudent } from '../../firebase/firestore'
import { formatCurrency, terms } from '../../utils/constants'

const statusColor = (status) => {
  const colors = {
    Paid:    'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Overdue: 'bg-red-100 text-red-600',
    Partial: 'bg-blue-100 text-blue-600',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

const MyFees = () => {
  const { student }   = useAuth()
  const [fees, setFees]             = useState([])
  const [filtered, setFiltered]     = useState([])
  const [termFilter, setTermFilter] = useState('')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!student) return
    const fetchData = async () => {
      try {
        const myFees = await getFeesByStudent(student.id)
        setFees(myFees)
        setFiltered(myFees)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [student])

  useEffect(() => {
    let results = fees
    if (termFilter) results = results.filter(f => f.term === termFilter)
    setFiltered(results)
  }, [termFilter, fees])

  const totalPaid    = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0)
  const totalPending = fees.filter(f => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading your fees...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Fees</h2>
        <p className="text-sm text-gray-500 mt-1">Your fee payment records</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Total Paid',    value: formatCurrency(totalPaid),    color: 'text-green-600' },
          { label: 'Total Pending', value: formatCurrency(totalPending), color: 'text-yellow-600' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-5"
          >
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <select
        value={termFilter}
        onChange={(e) => setTermFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Terms</option>
        {terms.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No fee records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Fee Type</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Term</th>
                  <th className="px-6 py-4 text-left">Due Date</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((fee, index) => (
                  <tr key={fee.id} className={`hover:bg-gray-50 transition ${
                    fee.status === 'Overdue' ? 'bg-red-50' : ''
                  }`}>
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{fee.feeType}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{fee.term}</td>
                    <td className="px-6 py-4 text-gray-600">{fee.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(fee.status)}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {fee.description || '—'}
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

export default MyFees