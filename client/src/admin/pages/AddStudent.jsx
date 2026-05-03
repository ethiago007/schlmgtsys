import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { addDocument } from '../../firebase/firestore'
import { MdArrowBack } from 'react-icons/md'

const schema = z.object({
  firstName:   z.string().min(1, 'First name is required'),
  lastName:    z.string().min(1, 'Last name is required'),
  email:       z.string().email('Enter a valid email'),
  phone:       z.string().min(10, 'Enter a valid phone number'),
  class:       z.string().min(1, 'Class is required'),
  gender:      z.string().min(1, 'Gender is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address:     z.string().min(1, 'Address is required'),
})

const classes = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3']

const AddStudent = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await addDocument('students', {
        ...data,
        status: 'active',
      })
      toast.success('Student added successfully!')
      reset()
      navigate('/admin/students')
    } catch (error) {
      toast.error('Failed to add student.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Reusable field styles
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
          onClick={() => navigate('/admin/students')}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <MdArrowBack size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Student</h2>
          <p className="text-sm text-gray-500">Fill in the details below to register a new student</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input {...register('firstName')} className={inputClass(errors.firstName)} placeholder="John" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input {...register('lastName')} className={inputClass(errors.lastName)} placeholder="Doe" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" className={inputClass(errors.email)} placeholder="john@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input {...register('phone')} className={inputClass(errors.phone)} placeholder="08012345678" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Class & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select {...register('class')} className={inputClass(errors.class)}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select {...register('gender')} className={inputClass(errors.gender)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>

          {/* DOB & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input {...register('dateOfBirth')} type="date" className={inputClass(errors.dateOfBirth)} />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input {...register('address')} className={inputClass(errors.address)} placeholder="123 Main St, Lagos" />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Add Student'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  )
}

export default AddStudent