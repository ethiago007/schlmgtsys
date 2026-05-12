import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  MdSearch,
  MdDelete,
  MdEdit,
  MdCheckCircle,
  MdCancel,
  MdCalendarToday,
} from "react-icons/md";
import {
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  getAttendanceByClassAndDate,
  getAttendanceByClass,
} from "../../firebase/firestore";
import { classes } from "../../utils/constant";
import DeleteModal from "../../shared/components/DeleteModal";
import { SkeletonTable } from "../../shared/components/Skeleton";

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0], // today's date by default
  );
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' | 'absent' }
  const [existingRecord, setExistingRecord] = useState(null); // if record already exists for today
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // History section
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [editingRecord, setEditingRecord] = useState(null);
  const deleteIdRef = useRef(null);

  // Load students and check for existing attendance when class or date changes
  const loadStudentsForClass = async () => {
    if (!selectedClass || !selectedDate) return;
    setLoadingStudents(true);

    try {
      // Get all students in the selected class
      const allStudents = await getCollection("students");
      const classStudents = allStudents.filter(
        (s) => s.class === selectedClass,
      );
      setStudents(classStudents);

      // Check if attendance already exists for this class + date
      const existing = await getAttendanceByClassAndDate(
        selectedClass,
        selectedDate,
      );

      if (existing) {
        // Pre-fill attendance from existing record
        setExistingRecord(existing);
        const attendanceMap = {};
        existing.records.forEach((r) => {
          attendanceMap[r.studentId] = r.status;
        });
        setAttendance(attendanceMap);
        toast("Attendance already recorded for this date — you can edit it.", {
          icon: "ℹ️",
        });
      } else {
        // Default everyone to present
        setExistingRecord(null);
        const defaultAttendance = {};
        classStudents.forEach((s) => {
          defaultAttendance[s.id] = "present";
        });
        setAttendance(defaultAttendance);
      }

      // Load history for this class
      loadHistory();
    } catch (error) {
      toast.error("Failed to load students");
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadHistory = async () => {
    if (!selectedClass) return;
    setLoadingHistory(true);
    try {
      const records = await getAttendanceByClass(selectedClass);
      setHistory(records);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Toggle a student's attendance status
  const toggleStatus = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  };

  // Save or update attendance
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
      const absentCount = records.filter((r) => r.status === "absent").length;

      const payload = {
        class: selectedClass,
        date: selectedDate,
        records,
        presentCount,
        absentCount,
        totalStudents: students.length,
      };

      if (existingRecord) {
        // Update existing record
        await updateDocument("attendance", existingRecord.id, payload);
        toast.success("Attendance updated!");
      } else {
        // Create new record
        await addDocument("attendance", payload);
        toast.success("Attendance saved!");
      }

      loadHistory();
    } catch (error) {
      toast.error("Failed to save attendance");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Delete attendance record
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
      toast.error("Failed to delete record");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  // Edit — load an old record back into the mark form
  const handleEdit = (record) => {
    setSelectedDate(record.date);
    setExistingRecord(record);
    const attendanceMap = {};
    record.records.forEach((r) => {
      attendanceMap[r.studentId] = r.status;
    });
    setAttendance(attendanceMap);
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Record loaded — make your changes and save.", { icon: "✏️" });
  };

  // Filtered history
  const filteredHistory = history.filter(
    (h) =>
      h.date?.includes(search) ||
      h.class?.toLowerCase().includes(search.toLowerCase()),
  );

  // Summary counts
  const presentCount = Object.values(attendance).filter(
    (s) => s === "present",
  ).length;
  const absentCount = Object.values(attendance).filter(
    (s) => s === "absent",
  ).length;

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">
          Mark and manage daily attendance
        </p>
      </div>

      {/* Mark Attendance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-6"
      >
        <h3 className="font-semibold text-gray-800">
          {editingRecord ? "✏️ Editing Attendance" : "📋 Mark Attendance"}
        </h3>

        {/* Class + Date + Load */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setStudents([]);
              setAttendance({});
              setExistingRecord(null);
              setEditingRecord(null);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

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
            onClick={loadStudentsForClass}
            disabled={!selectedClass || !selectedDate || loadingStudents}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {loadingStudents ? "Loading..." : "Load Students"}
          </button>

          {students.length > 0 && (
            <button
              onClick={() => {
                const allPresent = {};
                students.forEach((s) => (allPresent[s.id] = "present"));
                setAttendance(allPresent);
              }}
              className="border border-green-400 text-green-600 hover:bg-green-50 px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Mark All Present
            </button>
          )}

          {students.length > 0 && (
            <button
              onClick={() => {
                const allAbsent = {};
                students.forEach((s) => (allAbsent[s.id] = "absent"));
                setAttendance(allAbsent);
              }}
              className="border border-red-400 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Mark All Absent
            </button>
          )}
        </div>

        {/* Student List */}
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
                  <MdCheckCircle size={16} />
                  Present: {presentCount}
                </div>
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
                  <MdCancel size={16} />
                  Absent: {absentCount}
                </div>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {students.map((student, index) => {
                  const status = attendance[student.id] || "absent";
                  const isPresent = status === "present";

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
                      {/* Student Info */}
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
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {student.class}
                          </p>
                        </div>
                      </div>

                      {/* Toggle */}
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

              {/* Save Button */}
              <button
                onClick={saveAttendance}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60"
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

        {/* Empty State */}
        {students.length === 0 && !loadingStudents && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Select a class and date then click Load Students
          </div>
        )}
      </motion.div>

      {/* Attendance History */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              Attendance History — {selectedClass}
            </h3>
          </div>

          {/* Search */}
          <div className="relative">
            <MdSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* History Table */}
          {loadingHistory ? (
            <SkeletonTable rows={8} cols={7} />
          ) : filteredHistory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No attendance records yet for {selectedClass}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Class</th>
                    <th className="px-5 py-3 text-left">Total</th>
                    <th className="px-5 py-3 text-left">Present</th>
                    <th className="px-5 py-3 text-left">Absent</th>
                    <th className="px-5 py-3 text-left">Rate</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.map((record) => {
                    const rate = Math.round(
                      (record.presentCount / record.totalStudents) * 100,
                    );
                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-4 font-medium text-gray-800">
                          {record.date}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {record.class}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {record.totalStudents}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-green-600 font-semibold">
                            {record.presentCount}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-red-500 font-semibold">
                            {record.absentCount}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                rate >= 80
                                  ? "text-green-600"
                                  : rate >= 60
                                    ? "text-yellow-600"
                                    : "text-red-500"
                              }`}
                            >
                              {rate}%
                            </span>
                          </div>
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
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deletingId === deleteModal.id}
        title="Delete Attendance Record?"
        message="This will permanently remove this attendance record."
      />
    </div>
  );
};

export default Attendance;
