import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { addDocument, getCollection } from '../../firebase/firestore'
import { MdArrowBack } from 'react-icons/md'

const schema = z.object({
  name:      z.string().min(1, 'Class name is required'),
  teacherId: z.string().min(1, 'Please assign a teacher'),
  room:      z.string().min(1, 'Room number is required'),
  capacity:  z.string().min(1, 'Capacity is required'),
  term:      z.string().min(1, 'Term is required'),
  session:   z.string().min(1, 'Session is required'),
})

const classNames = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3']
const terms      = ['First Term', 'Second Term', 'Third Term']

const AddClass = () => {
  const [loading, setLoading]   = useState(false)
  const [teachers, setTeachers] = useState([])
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema)
  })

  // Fetch teachers to populate the dropdown
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getCollection('teachers')
        setTeachers(data)
      } catch (error) {
        toast.error('Failed to load teachers')
      }
    }
    fetchTeachers()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Find the selected teacher's full name to store alongside their ID
      const selectedTeacher = teachers.find(t => t.id === data.teacherId)

      await addDocument('classes', {
        ...data,
        teacherName: `${selectedTeacher.firstName} ${selectedTeacher.lastName}`,
        studentCount: 0,
      })

      toast.success('Class created successfully!')
      reset()
      navigate('/admin/classes')
    } catch (error) {
      toast.error('Failed to create class.')
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

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/classes')}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <MdArrowBack size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Class</h2>
          <p className="text-sm text-gray-500">Create a new class and assign a teacher</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Class Name & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <select {...register('name')} className={inputClass(errors.name)}>
                <option value="">Select class</option>
                {classNames.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input
                {...register('room')}
                className={inputClass(errors.room)}
                placeholder="e.g. Block A - Room 1"
              />
              {errors.room && <p className="text-red-500 text-xs mt-1">{errors.room.message}</p>}
            </div>
          </div>

          {/* Assign Teacher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Class Teacher</label>
            <select {...register('teacherId')} className={inputClass(errors.teacherId)}>
              <option value="">Select a teacher</option>
              {teachers.length === 0 ? (
                <option disabled>No teachers found — add teachers first</option>
              ) : (
                teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} — {t.subject}
                  </option>
                ))
              )}
            </select>
            {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId.message}</p>}
            {teachers.length === 0 && (
              <p className="text-yellow-600 text-xs mt-1">
                ⚠️ No teachers available. Please add teachers before creating a class.
              </p>
            )}
          </div>

          {/* Capacity, Term, Session */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                {...register('capacity')}
                type="number"
                className={inputClass(errors.capacity)}
                placeholder="e.g. 40"
              />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
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
              <input
                {...register('session')}
                className={inputClass(errors.session)}
                placeholder="e.g. 2024/2025"
              />
              {errors.session && <p className="text-red-500 text-xs mt-1">{errors.session.message}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/classes')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Create Class'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  )
}

export default AddClass