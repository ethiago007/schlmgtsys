import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  getGradesByStudent,
  getFeesByStudent,
  getCollection,
} from "../../firebase/firestore";
import { gradeColor, formatCurrency } from "../../utils/constant";
import {
  MdGrade,
  MdAttachMoney,
  MdEventNote,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import { SkeletonStatCard } from "../../shared/components/Skeleton";

const Home = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [recentGrades, setRecentGrades] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
  });
  const [pendingFees, setPendingFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;

    const fetchData = async () => {
      try {
        // Fetch grades and fees together
        const [myGrades, myFees] = await Promise.all([
          getGradesByStudent(student.id),
          getFeesByStudent(student.id),
        ]);

        setRecentGrades(myGrades.slice(0, 5));

        const pending = myFees.filter(
          (f) => f.status === "Pending" || f.status === "Overdue",
        );
        setPendingFees(pending);
      } catch (error) {
        console.error("Failed to load grades/fees:", error);
      }

      // Fetch attendance separately so it doesn't block the rest
      try {
        const allAttendance = await getCollection("attendance");
        let present = 0,
          absent = 0;
        allAttendance.forEach((record) => {
          const myEntry = record.records?.find(
            (r) => r.studentId === student.id,
          );
          if (myEntry?.status === "present") present++;
          if (myEntry?.status === "absent") absent++;
        });
        setAttendanceSummary({ present, absent });
      } catch (error) {
        console.error("Failed to load attendance:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, [student]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">
          Your student record was not found. Contact your school admin.
        </p>
      </div>
    );
  }

  const attendanceRate =
    attendanceSummary.present + attendanceSummary.absent > 0
      ? Math.round(
          (attendanceSummary.present /
            (attendanceSummary.present + attendanceSummary.absent)) *
            100,
        )
      : 0;

  const quickCards = [
    {
      label: "My Grades",
      icon: <MdGrade size={24} />,
      color: "bg-blue-500",
      value: `${recentGrades.length} records`,
      path: "/portal/grades",
    },
    {
      label: "Attendance Rate",
      icon: <MdEventNote size={24} />,
      color: attendanceRate >= 75 ? "bg-green-500" : "bg-red-500",
      value: `${attendanceRate}%`,
      path: "/portal/attendance",
    },
    {
      label: "Pending Fees",
      icon: <MdAttachMoney size={24} />,
      color: pendingFees.length > 0 ? "bg-yellow-500" : "bg-green-500",
      value:
        pendingFees.length > 0 ? `${pendingFees.length} unpaid` : "All clear",
      path: "/portal/fees",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white"
      >
        <p className="text-blue-200 text-sm">Welcome back 👋</p>
        <h2 className="text-2xl font-bold mt-1">
          {student.firstName} {student.lastName}
        </h2>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
            {student.class}
          </span>
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full capitalize">
            {student.gender}
          </span>
          {student.isSpecialCase && (
            <span className="bg-yellow-400/30 text-yellow-200 text-xs px-3 py-1 rounded-full">
              Special Admission
            </span>
          )}
        </div>
      </motion.div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div
              className={`w-12 h-12 rounded-xl ${card.color} text-white flex items-center justify-center`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Grades</h3>
            <button
              onClick={() => navigate("/portal/grades")}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          {recentGrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No grades yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentGrades.map((g) => (
                <div key={g.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {g.subject}
                    </p>
                    <p className="text-xs text-gray-400">
                      {g.term} · {g.session}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      {g.total}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(g.grade)}`}
                    >
                      {g.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Attendance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Attendance Summary</h3>
            <button
              onClick={() => navigate("/portal/attendance")}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={attendanceRate >= 75 ? "#22c55e" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${attendanceRate} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">
                  {attendanceRate}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MdCheckCircle className="text-green-500" size={16} />
                Present:{" "}
                <span className="font-bold">{attendanceSummary.present}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MdCancel className="text-red-500" size={16} />
                Absent:{" "}
                <span className="font-bold">{attendanceSummary.absent}</span>
              </div>
              {attendanceRate < 75 && (
                <p className="text-xs text-red-500 font-medium">
                  ⚠️ Below 75% attendance threshold
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending Fees Alert */}
      {pendingFees.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/portal/fees")}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 cursor-pointer hover:bg-yellow-100 transition"
        >
          <div className="flex items-center gap-3">
            <MdAttachMoney size={24} className="text-yellow-600" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">
                You have {pendingFees.length} unpaid fee
                {pendingFees.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Total outstanding:{" "}
                {formatCurrency(pendingFees.reduce((s, f) => s + f.amount, 0))}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
