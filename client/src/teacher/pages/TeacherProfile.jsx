import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdCake,
  MdPerson,
  MdWork,
} from "react-icons/md";

const TeacherProfile = () => {
  const { teacher } = useAuth();

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">
          Profile not found. Contact admin.
        </p>
      </div>
    );
  }

  const details = [
    { icon: <MdEmail size={18} />, label: "Email", value: teacher.email },
    { icon: <MdPhone size={18} />, label: "Phone", value: teacher.phone },
    {
      icon: <MdLocationOn size={18} />,
      label: "Address",
      value: teacher.address,
    },
    { icon: <MdSchool size={18} />, label: "Subject", value: teacher.subject },
    {
      icon: <MdWork size={18} />,
      label: "Qualification",
      value: teacher.qualification,
    },
    { icon: <MdPerson size={18} />, label: "Gender", value: teacher.gender },
    {
      icon: <MdCake size={18} />,
      label: "Date of Birth",
      value: teacher.dateOfBirth,
    },
    {
      icon: <MdWork size={18} />,
      label: "Employment Date",
      value: teacher.employedDate,
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Your personal information</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-green-100 text-green-600 text-3xl font-bold flex items-center justify-center">
            {teacher.firstName?.charAt(0)}
            {teacher.lastName?.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mt-4">
            {teacher.firstName} {teacher.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-semibold">
              {teacher.subject}
            </span>
            <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
              {teacher.qualification}
            </span>
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full capitalize">
              {teacher.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {details.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="text-gray-400 shrink-0">{item.icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-medium text-gray-800 capitalize truncate">
                  {item.value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherProfile;
