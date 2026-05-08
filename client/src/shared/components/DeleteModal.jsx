import { motion, AnimatePresence } from 'framer-motion'
import { MdWarning } from 'react-icons/md'

const DeleteModal = ({ isOpen, onClose, onConfirm, loading, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 inset-0 flex items-center justify-center px-4"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">

              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <MdWarning size={24} className="text-red-500" />
              </div>

              {/* Text */}
              <h3 className="text-lg font-bold text-gray-800 text-center">
                {title || 'Delete this record?'}
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                {message || 'This action cannot be undone.'}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DeleteModal