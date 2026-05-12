import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdCake,
  MdPerson,
  MdDownload,
} from "react-icons/md";
import { downloadReportCard } from "../../utils/downloadReportCard";
import { useState } from "react";

const Profile = () => {
  const { student } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [termFilter, setTermFilter] = useState("");

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">
          Profile not found. Contact your school admin.
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!termFilter || !sessionFilter) {
      toast.error("Select a term and session first");
      return;
    }
    setDownloading(true);
    try {
      await downloadReportCard(
        student.id,
        termFilter,
        sessionFilter,
        `${student.firstName} ${student.lastName}`,
      );
      toast.success("Report card downloaded!");
    } catch (error) {
      toast.error(error.message || "Failed to download");
    } finally {
      setDownloading(false);
    }
  };

  const details = [
    { icon: <MdEmail size={18} />, label: "Email", value: student.email },
    { icon: <MdPhone size={18} />, label: "Phone", value: student.phone },
    {
      icon: <MdLocationOn size={18} />,
      label: "Address",
      value: student.address,
    },
    { icon: <MdSchool size={18} />, label: "Class", value: student.class },
    { icon: <MdPerson size={18} />, label: "Gender", value: student.gender },
    {
      icon: <MdCake size={18} />,
      label: "Date of Birth",
      value: student.dateOfBirth,
    },
  ];

  const handleDownloadReport = async () => {
    if (!termFilter || !sessionFilter) {
      toast.error(
        "Please select both a term and session to download the report card",
      );
      return;
    }
    setDownloading(true);
    try {
      await downloadReportCard(
        id,
        termFilter,
        sessionFilter,
        `${student.firstName} ${student.lastName}`,
      );
      toast.success("Report card downloaded!");
    } catch (error) {
      toast.error(error.message || "Failed to download report card");
    } finally {
      setDownloading(false);
    }
  };

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
          <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 text-3xl font-bold flex items-center justify-center">
            {student.firstName?.charAt(0)}
            {student.lastName?.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mt-4">
            {student.firstName} {student.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-semibold">
              {student.class}
            </span>
            <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full capitalize">
              {student.status}
            </span>
            {student.isSpecialCase && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
                Special Admission
              </span>
            )}
          </div>

          {/* <button
  onClick={handleDownloadReport}
  disabled={downloading || !termFilter || !sessionFilter}
  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
>
  <MdDownload size={16} />
  {downloading ? 'Generating...' : 'Download Report Card'}
</button> */}
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

export default Profile;
