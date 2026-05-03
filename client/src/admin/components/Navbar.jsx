import { MdMenu, MdNotifications, MdLogout } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../firebase/auth'
import { useAuth } from '../../context/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser()
      toast.success('Logged out')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Toaster position="top-right" />

      {/* Left — toggle button */}
      <button
        onClick={onToggleSidebar}
        className="text-gray-500 hover:text-gray-800 transition"
      >
        <MdMenu size={24} />
      </button>

      {/* Right — user info + actions */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button className="relative text-gray-500 hover:text-gray-800 transition">
          <MdNotifications size={22} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">{user?.email}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition"
        >
          <MdLogout size={18} />
          <span className="hidden sm:block">Logout</span>
        </button>

      </div>
    </header>
  )
}

export default Navbar