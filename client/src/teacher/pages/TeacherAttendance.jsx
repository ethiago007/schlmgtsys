import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  MdCheckCircle,
  MdCancel,
  MdCalendarToday,
  MdDelete,
  MdEdit,
} from "react-icons/md";
import {
  getStudentsByClass,
  addDocument,
  updateDocument,
  deleteDocument,
  getAttendanceByClassAndDate,
  getAttendanceByClass,
} from "../../firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import DeleteModal from "../../shared/components/DeleteModal";
import {
  SkeletonStatCard,
  SkeletonCard,
} from "../../shared/components/Skeleton";
import { SkeletonTable } from "../../shared/components/Skeleton";

const TeacherAttendance = () => {
  const { teacher } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existingRecord, setExistingRecord] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const deleteIdRef = useRef(null);

  const loadStudents = async () => {
    if (!teacher?.class || !selectedDate) return;
    setLoadingStudents(true);
    try {
      const classStudents = await getStudentsByClass(teacher.class);
      setStudents(classStudents);

      const existing = await getAttendanceByClassAndDate(
        teacher.class,
        selectedDate,
      );
      if (existing) {
        setExistingRecord(existing);
        const map = {};
        existing.records.forEach((r) => {
          map[r.studentId] = r.status;
        });
        setAttendance(map);
        toast("Attendance already recorded — you can edit it.", { icon: "ℹ️" });
      } else {
        setExistingRecord(null);
        const defaultMap = {};
        classStudents.forEach((s) => {
          defaultMap[s.id] = "present";
        });
        setAttendance(defaultMap);
      }
      loadHistory();
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadHistory = async () => {
    if (!teacher?.class) return;
    setLoadingHistory(true);
    try {
      const records = await getAttendanceByClass(teacher.class);
      setHistory(records);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  };

  const saveAttendance = async () => {
    if (students.length === 0) return toast.error("No students loaded");
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        status: attendance[s.id] || "absent",
      }));

      const presentCount = records.filter((r) => r.status === "present").length;
      const payload = {
        class: teacher.class,
        date: selectedDate,
        records,
        presentCount,
        absentCount: students.length - presentCount,
        totalStudents: students.length,
        markedBy: `${teacher.firstName} ${teacher.lastName}`,
      };

      if (existingRecord) {
        await updateDocument("attendance", existingRecord.id, payload);
        toast.success("Attendance updated!");
      } else {
        await addDocument("attendance", payload);
        toast.success("Attendance saved!");
      }
      loadHistory();
    } catch (error) {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    deleteIdRef.current = id;
    setDeleteModal({ open: true, id });
  };

  const handleDelete = async () => {
    const id = deleteIdRef.current;
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteDocument("attendance", id);
      toast.success("Record deleted");
      setDeleteModal({ open: false, id: null });
      deleteIdRef.current = null;
      loadHistory();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (record) => {
    setSelectedDate(record.date);
    setExistingRecord(record);
    const map = {};
    record.records.forEach((r) => {
      map[r.studentId] = r.status;
    });
    setAttendance(map);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Record loaded — make changes and save.", { icon: "✏️" });
  };

  const presentCount = Object.values(attendance).filter(
    (s) => s === "present",
  ).length;
  const absentCount = Object.values(attendance).filter(
    (s) => s === "absent",
  ).length;

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">
          Class:{" "}
          <span className="font-semibold text-green-600">{teacher?.class}</span>
        </p>
      </div>

      {/* Mark Attendance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-6"
      >
        <h3 className="font-semibold text-gray-800">📋 Mark Attendance</h3>

        {/* Date + Load */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5">
            <MdCalendarToday size={16} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={loadStudents}
            disabled={!selectedDate || loadingStudents}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {loadingStudents ? "Loading..." : "Load Students"}
          </button>
          {students.length > 0 && (
            <>
              <button
                onClick={() => {
                  const all = {};
                  students.forEach((s) => {
                    all[s.id] = "present";
                  });
                  setAttendance(all);
                }}
                className="border border-green-400 text-green-600 hover:bg-green-50 px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                All Present
              </button>
              <button
                onClick={() => {
                  const all = {};
                  students.forEach((s) => {
                    all[s.id] = "absent";
                  });
                  setAttendance(all);
                }}
                className="border border-red-400 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                All Absent
              </button>
            </>
          )}
        </div>

        <AnimatePresence>
          {students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                  <MdCheckCircle size={16} /> Present: {presentCount}
                </div>
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
                  <MdCancel size={16} /> Absent: {absentCount}
                </div>
              </div>

              {/* Students */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {students.map((student, index) => {
                  const isPresent = attendance[student.id] === "present";
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center justify-between px-5 py-4 transition ${
                        isPresent ? "bg-white" : "bg-red-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                            isPresent
                              ? "bg-blue-100 text-blue-600"
                              : "bg-red-100 text-red-500"
                          }`}
                        >
                          {student.firstName?.charAt(0)}
                          {student.lastName?.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleStatus(student.id)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                          isPresent
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        {isPresent ? (
                          <>
                            <MdCheckCircle size={14} /> Present
                          </>
                        ) : (
                          <>
                            <MdCancel size={14} /> Absent
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={saveAttendance}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : existingRecord
                    ? "Update Attendance"
                    : "Save Attendance"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {students.length === 0 && !loadingStudents && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Select a date and click Load Students
          </div>
        )}
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
      >
        <h3 className="font-semibold text-gray-800">Attendance History</h3>
        {loadingHistory ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <SkeletonTable rows={6} cols={5} />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No records yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Present</th>
                  <th className="px-5 py-3 text-left">Absent</th>
                  <th className="px-5 py-3 text-left">Rate</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((record) => {
                  const rate = Math.round(
                    (record.presentCount / record.totalStudents) * 100,
                  );
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {record.date}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {record.totalStudents}
                      </td>
                      <td className="px-5 py-4 text-green-600 font-semibold">
                        {record.presentCount}
                      </td>
                      <td className="px-5 py-4 text-red-500 font-semibold">
                        {record.absentCount}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold ${rate >= 80 ? "text-green-600" : rate >= 60 ? "text-yellow-600" : "text-red-500"}`}
                        >
                          {rate}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-400 hover:text-blue-600 transition"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(record.id);
                            }}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deletingId === deleteModal.id}
        title="Delete Attendance Record?"
        message="This will permanently remove this record."
      />
    </div>
  );
};

export default TeacherAttendance;
