import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  MdArrowBack,
  MdEdit,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
} from "react-icons/md";
import { getDocument, getCollection } from "../../firebase/firestore";
import { gradeColor, terms, sessions } from "../../utils/constant";
import { getAttendanceByStudent } from "../../firebase/firestore";
import { SkeletonProfile } from "../../shared/components/Skeleton";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [termFilter, setTermFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [fetching, setFetching] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentData, allGrades] = await Promise.all([
          getDocument("students", id),
          getCollection("grades"),
        ]);

        if (!studentData) {
          toast.error("Student not found");
          navigate("/admin/students");
          return;
        }

        setStudent(studentData);

        // Only grades belonging to this student
        const studentGrades = allGrades.filter((g) => g.studentId === id);
        setGrades(studentGrades);
        setFiltered(studentGrades);
      } catch (error) {
        toast.error("Failed to load student profile");
      } finally {
        setFetching(false);
      }

      const attendance = await getAttendanceByStudent(id);
      setAttendanceRecords(attendance);
    };
    fetchData();
  }, [id]);

  // Filter grades by term and session
  useEffect(() => {
    let results = grades;
    if (termFilter) results = results.filter((g) => g.term === termFilter);
    if (sessionFilter)
      results = results.filter((g) => g.session === sessionFilter);
    setFiltered(results);
  }, [termFilter, sessionFilter, grades]);

  // Calculate term summary
  const summary = (() => {
    if (filtered.length === 0) return null;
    const total = filtered.reduce((sum, g) => sum + g.total, 0);
    const average = Math.round(total / filtered.length);
    const { grade, remark } =
      filtered.length > 0
        ? { grade: filtered[0].grade, remark: filtered[0].remark }
        : { grade: "-", remark: "-" };
    const overallGrade =
      average >= 70
        ? "A"
        : average >= 60
          ? "B"
          : average >= 50
            ? "C"
            : average >= 45
              ? "D"
              : average >= 40
                ? "E"
                : "F";
    const overallRemark =
      average >= 70
        ? "Excellent"
        : average >= 60
          ? "Very Good"
          : average >= 50
            ? "Good"
            : average >= 45
              ? "Pass"
              : average >= 40
                ? "Poor"
                : "Fail";
    return { total: filtered.length, average, overallGrade, overallRemark };
  })();

  if (fetching) {
    return <SkeletonProfile />;
  }

  if (!student) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/students")}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <MdArrowBack size={22} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
          <p className="text-sm text-gray-500">Full academic record</p>
        </div>
        <button
          onClick={() => navigate(`/admin/students/edit/${id}`)}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          <MdEdit size={16} />
          Edit Student
        </button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-6"
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 text-2xl font-bold flex items-center justify-center shrink-0">
            {student.firstName?.charAt(0)}
            {student.lastName?.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-gray-800">
                {student.firstName} {student.lastName}
              </h3>
              <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full capitalize">
                {student.status}
              </span>
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                {student.class}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdEmail size={16} className="text-gray-400" />
                {student.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdPhone size={16} className="text-gray-400" />
                {student.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdLocationOn size={16} className="text-gray-400" />
                {student.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdSchool size={16} className="text-gray-400" />
                {student.gender} · DOB: {student.dateOfBirth}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Terms</option>
          {terms.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sessions</option>
          {sessions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(termFilter || sessionFilter) && (
          <button
            onClick={() => {
              setTermFilter("");
              setSessionFilter("");
            }}
            className="text-sm text-red-400 hover:text-red-600 transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Term Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-sm text-gray-400">Subjects Taken</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {summary.total}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-sm text-gray-400">Average Score</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {summary.average}
              <span className="text-sm text-gray-400">%</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-sm text-gray-400">Overall Grade</p>
            <p
              className={`text-3xl font-bold mt-1 ${summary.overallGrade === "A" ? "text-green-600" : summary.overallGrade === "F" ? "text-red-600" : "text-yellow-600"}`}
            >
              {summary.overallGrade}
              <span className="text-sm text-gray-400 ml-1">
                — {summary.overallRemark}
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Grades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Grades
            {termFilter && (
              <span className="text-blue-600 ml-2 text-sm font-normal">
                · {termFilter}
              </span>
            )}
            {sessionFilter && (
              <span className="text-blue-600 ml-2 text-sm font-normal">
                · {sessionFilter}
              </span>
            )}
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No grades found{" "}
            {termFilter || sessionFilter
              ? "for the selected filters."
              : "for this student yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Subject</th>
                  <th className="px-6 py-4 text-left">C. Test</th>
                  <th className="px-6 py-4 text-left">Mid Term</th>
                  <th className="px-6 py-4 text-left">Exam</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Grade</th>
                  <th className="px-6 py-4 text-left">Remark</th>
                  <th className="px-6 py-4 text-left">Term</th>
                  <th className="px-6 py-4 text-left">Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((g, index) => (
                  <tr key={g.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {g.subject}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{g.classTest}</td>
                    <td className="px-6 py-4 text-gray-600">{g.midTerm}</td>
                    <td className="px-6 py-4 text-gray-600">{g.exam}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {g.total}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${gradeColor(g.grade)}`}
                      >
                        {g.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{g.remark}</td>
                    <td className="px-6 py-4 text-gray-600">{g.term}</td>
                    <td className="px-6 py-4 text-gray-600">{g.session}</td>
                  </tr>
                ))}
              </tbody>

              {/* Footer total row */}
              {summary && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-sm font-semibold text-gray-600"
                    >
                      Average ({summary.total} subjects)
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {summary.average}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${gradeColor(summary.overallGrade)}`}
                      >
                        {summary.overallGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {summary.overallRemark}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Attendance Summary</h3>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No attendance records for this student yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Class</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceRecords.map((record) => {
                  const studentRecord = record.records?.find(
                    (r) => r.studentId === id,
                  );
                  const isPresent = studentRecord?.status === "present";
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-700">{record.date}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {record.class}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isPresent
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-500"
                          }`}
                        >
                          {isPresent ? "Present" : "Absent"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentProfile;
