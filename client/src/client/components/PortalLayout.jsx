import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { logoutUser } from "../../firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import {
  MdDashboard,
  MdGrade,
  MdAttachMoney,
  MdEventNote,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdNotifications,
  MdMessage,
} from "react-icons/md";

const navItems = [
  { label: "Home", icon: <MdDashboard size={20} />, path: "/portal" },
  { label: "My Grades", icon: <MdGrade size={20} />, path: "/portal/grades" },
  {
    label: "Attendance",
    icon: <MdEventNote size={20} />,
    path: "/portal/attendance",
  },
  { label: "My Fees", icon: <MdAttachMoney size={20} />, path: "/portal/fees" },
  {
    label: "Messages",
    icon: <MdMessage size={20} />,
    path: "/portal/messages",
  },
  { label: "Profile", icon: <MdPerson size={20} />, path: "/portal/profile" },
];

const PortalLayout = () => {
  const { user } = useAuth();
  const { totalUnread, unreadMessages, unreadAnnouncements } =
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

      {/* ── Top Navbar ───────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-800 transition p-1"
            >
              {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-700">
                🏫 SchoolMS
              </span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                Student Portal
              </span>
            </div>
          </div>

          {/* Center — Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/portal"}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
                {item.path === "/portal/messages" && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-gray-500 hover:text-gray-800 transition rounded-lg hover:bg-gray-100"
              >
                <MdNotifications size={22} />
                <AnimatePresence>
                  {totalUnread > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none"
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
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="font-semibold text-gray-800 text-sm">
                          Notifications
                        </p>
                        {totalUnread > 0 && (
                          <span className="text-xs text-gray-400">
                            {totalUnread} new
                          </span>
                        )}
                      </div>

                      <div className="divide-y divide-gray-50">
                        {unreadMessages > 0 && (
                          <button
                            onClick={() => {
                              navigate("/portal/messages");
                              setShowNotifDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <MdMessage size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">
                                {unreadMessages} message repl
                                {unreadMessages > 1 ? "ies" : "y"}
                              </p>
                              <p className="text-xs text-gray-400">
                                Someone replied to you
                              </p>
                            </div>
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0">
                              {unreadMessages}
                            </span>
                          </button>
                        )}

                        {unreadAnnouncements > 0 && (
                          <button
                            onClick={() => {
                              navigate("/portal/messages");
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
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0">
                              {unreadAnnouncements}
                            </span>
                          </button>
                        )}

                        {totalUnread === 0 && (
                          <div className="px-4 py-8 text-center">
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

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition p-1"
            >
              <MdLogout size={18} />
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Menu ───────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 overflow-hidden"
            >
              <div className="px-3 py-2 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/portal"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.path === "/portal/messages" && totalUnread > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {totalUnread}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page Content ─────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
