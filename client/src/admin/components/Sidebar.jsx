import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdClass,
  MdGrade,
  MdAttachMoney,
  MdEventNote,
  MdMessage,
} from "react-icons/md";

const navItems = [
  { label: "Dashboard", icon: <MdDashboard size={20} />, path: "/admin" },
  { label: "Students", icon: <MdPeople size={20} />, path: "/admin/students" },
  { label: "Teachers", icon: <MdSchool size={20} />, path: "/admin/teachers" },
  { label: "Classes", icon: <MdClass size={20} />, path: "/admin/classes" },
  { label: "Grades", icon: <MdGrade size={20} />, path: "/admin/grades" },
  {
    label: "Attendance",
    icon: <MdEventNote size={20} />,
    path: "/admin/attendance",
  },
  { label: "Fees", icon: <MdAttachMoney size={20} />, path: "/admin/fees" },
  { label: "Messages", icon: <MdMessage size={20} />, path: "/admin/messages" },
];

const Sidebar = ({ isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-900 text-white h-full flex flex-col overflow-hidden"
        >
          {/* Logo */}
          <div className="px-6 py-5 border-b border-blue-800">
            <h1 className="text-xl font-bold tracking-wide">🏫 SchoolMS</h1>
            <p className="text-xs text-blue-300 mt-0.5">Admin Panel</p>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                  ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-6 py-4 border-t border-blue-800 text-xs text-blue-400">
            © 2025 SchoolMS
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
