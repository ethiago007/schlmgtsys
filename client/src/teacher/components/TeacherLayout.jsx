import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { logoutUser } from "../../firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import {
  MdDashboard,
  MdPeople,
  MdGrade,
  MdEventNote,
  MdMessage,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdNotifications,
} from "react-icons/md";

const navItems = [
  { label: "Home", icon: <MdDashboard size={20} />, path: "/teacher" },
  { label: "My Class", icon: <MdPeople size={20} />, path: "/teacher/class" },
  { label: "Grades", icon: <MdGrade size={20} />, path: "/teacher/grades" },
  {
    label: "Attendance",
    icon: <MdEventNote size={20} />,
    path: "/teacher/attendance",
  },
  {
    label: "Messages",
    icon: <MdMessage size={20} />,
    path: "/teacher/messages",
  },
  { label: "Profile", icon: <MdPerson size={20} />, path: "/teacher/profile" },
];

const TeacherLayout = () => {
  const { user, teacher } = useAuth();
  const { unreadMessages, unreadAnnouncements, totalUnread } =
    useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            className="sm:hidden text-gray-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-green-700">🏫 SchoolMS</h1>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full hidden sm:block">
            Teacher Portal
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/teacher"}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
              {item.path === "/teacher/messages" && totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative text-gray-500 hover:text-gray-800 transition"
            >
              <MdNotifications size={22} />
              <AnimatePresence>
                {totalUnread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                  >
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {showNotifDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm">
                        Notifications
                      </p>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {unreadMessages > 0 && (
                        <button
                          onClick={() => {
                            navigate("/teacher/messages");
                            setShowNotifDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                            <MdMessage size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              {unreadMessages} new message
                              {unreadMessages > 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-gray-400">
                              From your students
                            </p>
                          </div>
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {unreadMessages}
                          </span>
                        </button>
                      )}

                      {unreadAnnouncements > 0 && (
                        <button
                          onClick={() => {
                            navigate("/teacher/messages");
                            setShowNotifDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                            <MdNotifications size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              {unreadAnnouncements} announcement
                              {unreadAnnouncements > 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-gray-400">
                              From school admin
                            </p>
                          </div>
                          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {unreadAnnouncements}
                          </span>
                        </button>
                      )}

                      {totalUnread === 0 && (
                        <div className="px-4 py-6 text-center">
                          <MdNotifications
                            size={32}
                            className="text-gray-200 mx-auto mb-2"
                          />
                          <p className="text-sm text-gray-400">
                            No new notifications
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Teacher info */}
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-gray-800">
              {teacher?.firstName} {teacher?.lastName}
            </p>
            <p className="text-xs text-gray-400">{teacher?.subject}</p>
          </div>

          <div className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center">
            {teacher?.firstName?.charAt(0)}
            {teacher?.lastName?.charAt(0)}
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
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/teacher"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                {item.icon}
                {item.label}
                {item.path === "/teacher/messages" && totalUnread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {totalUnread}
                  </span>
                )}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
