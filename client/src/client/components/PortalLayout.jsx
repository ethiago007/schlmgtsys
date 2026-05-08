import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/auth'
import toast, { Toaster } from 'react-hot-toast'
import {
  MdDashboard,
  MdGrade,
  MdAttachMoney,
  MdEventNote,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
} from 'react-icons/md'

const navItems = [
  { label: 'Home',       icon: <MdDashboard size={20} />, path: '/portal' },
  { label: 'My Grades',  icon: <MdGrade size={20} />,     path: '/portal/grades' },
  { label: 'Attendance', icon: <MdEventNote size={20} />, path: '/portal/attendance' },
  { label: 'My Fees',    icon: <MdAttachMoney size={20}/>, path: '/portal/fees' },
  { label: 'Profile',    icon: <MdPerson size={20} />,    path: '/portal/profile' },
]

const PortalLayout = () => {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            className="sm:hidden text-gray-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-blue-700">🏫 SchoolMS</h1>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full hidden sm:block">
            Student Portal
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/portal'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition"
          >
            <MdLogout size={18} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1 sticky top-16 z-20"
          >
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/portal'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default PortalLayout