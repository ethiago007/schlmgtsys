import { useNavigate } from "react-router-dom";
import { MdMenu, MdNotifications, MdLogout, MdMessage } from "react-icons/md";
import { logoutUser } from "../../firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { unreadMessages, totalUnread } = useNotifications();
  const navigate = useNavigate();
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
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between relative">
      <Toaster position="top-right" />

      {/* Left — toggle button */}
      <button
        onClick={onToggleSidebar}
        className="text-gray-500 hover:text-gray-800 transition"
      >
        <MdMenu size={24} />
      </button>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative text-gray-500 hover:text-gray-800 transition"
          >
            <MdNotifications size={22} />

            {/* Badge */}
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

          {/* Dropdown */}
          <AnimatePresence>
            {showNotifDropdown && (
              <>
                {/* Backdrop */}
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
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">
                      Notifications
                    </p>
                    {totalUnread > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {totalUnread} new notification
                        {totalUnread > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Notification Items */}
                  <div className="divide-y divide-gray-50">
                    {unreadMessages > 0 ? (
                      <button
                        onClick={() => {
                          navigate("/admin/messages");
                          setShowNotifDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <MdMessage size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            {unreadMessages} unread message
                            {unreadMessages > 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-400">
                            Click to view messages
                          </p>
                        </div>
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          {unreadMessages}
                        </span>
                      </button>
                    ) : (
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

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">
            {user?.email}
          </span>
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
  );
};

export default Navbar;
