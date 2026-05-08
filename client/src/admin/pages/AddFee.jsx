import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { addDocument, getCollection } from '../../firebase/firestore'
import { feeTypes, feeStatuses, terms, sessions } from '../../utils/constant'
import { MdArrowBack } from 'react-icons/md'

const schema = z.object({
  studentId:   z.string().min(1, 'Please select a student'),
  feeType:     z.string().min(1, 'Fee type is required'),
  amount:      z.string().min(1, 'Amount is required'),
  term:        z.string().min(1, 'Term is required'),
  session:     z.string().min(1, 'Session is required'),
  dueDate:     z.string().min(1, 'Due date is required'),
  status:      z.string().min(1, 'Status is required'),
  description: z.string().optional(),
})

const AddFee = () => {
  const [loading, setLoading]   = useState(false)
  const [students, setStudents] = useState([])
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Pending' }
  })

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getCollection('students')
        setStudents(data)
      } catch (error) {
        toast.error('Failed to load students')
      }
    }
    fetchStudents()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const selectedStudent = students.find(s => s.id === data.studentId)
      await addDocument('fees', {
        ...data,
        amount:       parseFloat(data.amount),
        studentName:  `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        studentClass: selectedStudent.class,
      })
      toast.success('Fee record added!')
      reset()
      navigate('/admin/fees')
    } catch (error) {
      toast.error('Failed to add fee record.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (error) =>
    `w-full border ${error ? 'border-red-400' : 'border-gray-300'} 
    rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 
    focus:ring-blue-500 transition`

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/fees')} className="text-gray-500 hover:text-gray-800 transition">
          <MdArrowBack size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Fee Record</h2>
          <p className="text-sm text-gray-500">Create a new fee entry for a student</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select {...register('studentId')} className={inputClass(errors.studentId)}>
              <option value="">Select a student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} — {s.class}
                </option>
              ))}
            </select>
            {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>}
          </div>

          {/* Fee Type & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
              <select {...register('feeType')} className={inputClass(errors.feeType)}>
                <option value="">Select fee type</option>
                {feeTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.feeType && <p className="text-red-500 text-xs mt-1">{errors.feeType.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
              <input
                {...register('amount')}
                type="number"
                className={inputClass(errors.amount)}
                placeholder="e.g. 50000"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Term & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select {...register('term')} className={inputClass(errors.term)}>
                <option value="">Select term</option>
                {terms.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.term && <p className="text-red-500 text-xs mt-1">{errors.term.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select {...register('session')} className={inputClass(errors.session)}>
                <option value="">Select session</option>
                {sessions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.session && <p className="text-red-500 text-xs mt-1">{errors.session.message}</p>}
            </div>
          </div>

          {/* Due Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                {...register('dueDate')}
                type="date"
                className={inputClass(errors.dueDate)}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className={inputClass(errors.status)}>
                {feeStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={inputClass(errors.description)}
              placeholder="Any additional notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/fees')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Add Fee Record'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  )
}

export default AddFee