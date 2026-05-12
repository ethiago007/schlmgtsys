import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import { getCollection, deleteDocument } from "../../firebase/firestore";
import { gradeColor, terms } from "../../utils/constant";
import DeleteModal from "../../shared/components/DeleteModal";
import Pagination from "../../shared/components/Pagination";
import usePagination from "../../hooks/usePagination";
import { SkeletonTable } from "../../shared/components/Skeleton";

// View modes
const VIEWS = ["All", "By Student", "By Subject", "By Class"];

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [view, setView] = useState("All");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedGrades,
    setCurrentPage,
    resetPage,
    totalItems,
    itemsPerPage,
  } = usePagination(filtered, 10);

  // Reset page when search changes
  useEffect(() => {
    resetPage();
  }, [search]);

  const fetchGrades = async () => {
    try {
      const data = await getCollection("grades");
      setGrades(data);
      setFiltered(data);
    } catch (error) {
      toast.error("Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    let results = grades;
    if (termFilter) results = results.filter((g) => g.term === termFilter);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (g) =>
          g.studentName?.toLowerCase().includes(q) ||
          g.subject?.toLowerCase().includes(q) ||
          g.studentClass?.toLowerCase().includes(q),
      );
    }
    setFiltered(results);
  }, [search, termFilter, grades]);

  const confirmDelete = (id) => {
    setDeleteModal({ open: true, id });
  };

  // Actually deletes when user confirms in modal
  const handleDelete = async () => {
    const id = deleteModal.id; // ← capture it first before anything async runs

    if (!id) {
      toast.error("No record selected");
      return;
    }

    setDeletingId(id);
    try {
      await deleteDocument("grades", id); // ← use captured id
      toast.success("Grade deleted");
      setDeleteModal({ open: false, id: null });
      fetchGrades();
    } catch (error) {
      console.error("Delete error:", error.code, error.message);
      toast.error("Failed to delete grade");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Group helpers ──────────────────────────────────────

  const groupBy = (key) => {
    return filtered.reduce((acc, grade) => {
      const groupKey = grade[key] || "Unknown";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(grade);
      return acc;
    }, {});
  };

  const getGroupSummary = (groupGrades) => {
    const avg = Math.round(
      groupGrades.reduce((s, g) => s + g.total, 0) / groupGrades.length,
    );
    const overallGrade =
      avg >= 70
        ? "A"
        : avg >= 60
          ? "B"
          : avg >= 50
            ? "C"
            : avg >= 45
              ? "D"
              : avg >= 40
                ? "E"
                : "F";
    return { avg, overallGrade, count: groupGrades.length };
  };

  // ── Grouped View Component ─────────────────────────────

  const GroupedView = ({ groupKey, labelKey, onClickRow }) => {
    const groups = groupBy(groupKey);
    return (
      <div className="space-y-3">
        {Object.entries(groups).map(([label, groupGrades]) => {
          const { avg, overallGrade, count } = getGroupSummary(groupGrades);
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Group Header */}
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => onClickRow && onClickRow(groupGrades[0])}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">
                    {label.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">
                      {count} {count === 1 ? "record" : "records"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Average</p>
                    <p className="font-bold text-gray-800">{avg}%</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${gradeColor(overallGrade)}`}
                  >
                    {overallGrade}
                  </span>
                </div>
              </div>

              {/* Group Rows */}
              <div className="border-t border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 text-left">Subject</th>
                      <th className="px-6 py-3 text-left">Student</th>
                      <th className="px-6 py-3 text-left">Class</th>
                      <th className="px-6 py-3 text-left">Total</th>
                      <th className="px-6 py-3 text-left">Grade</th>
                      <th className="px-6 py-3 text-left">Term</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 text-gray-700">{g.subject}</td>
                        <td className="px-6 py-3 text-gray-700">
                          {g.studentName}
                        </td>
                        <td className="px-6 py-3 text-gray-500">
                          {g.studentClass}
                        </td>
                        <td className="px-6 py-3 font-semibold text-gray-800">
                          {g.total}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(g.grade)}`}
                          >
                            {g.grade}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500">{g.term}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                navigate(`/admin/grades/edit/${g.id}`)
                              }
                              className="text-blue-400 hover:text-blue-600 transition"
                            >
                              <MdEdit size={16} />
                            </button>
                            <button
                              onClick={() => confirmDelete(g.id)}
                              disabled={deletingId === g.id}
                              className="text-red-400 hover:text-red-600 transition disabled:opacity-40"
                            >
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Grades</h2>
          <p className="text-sm text-gray-500 mt-1">
            {grades.length} grade records
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/grades/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdAdd size={18} />
          Record Grade
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 flex-wrap">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === v
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MdSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by student, subject or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTable rows={8} cols={7} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          {search || termFilter
            ? "No grades match your filters."
            : "No grades recorded yet."}
        </div>
      ) : (
        <>
          {/* All View */}
          {view === "All" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 text-left">#</th>
                      <th className="px-6 py-4 text-left">Student</th>
                      <th className="px-6 py-4 text-left">Class</th>
                      <th className="px-6 py-4 text-left">Subject</th>
                      <th className="px-6 py-4 text-left">C.Test</th>
                      <th className="px-6 py-4 text-left">Mid Term</th>
                      <th className="px-6 py-4 text-left">Exam</th>
                      <th className="px-6 py-4 text-left">Total</th>
                      <th className="px-6 py-4 text-left">Grade</th>
                      <th className="px-6 py-4 text-left">Remark</th>
                      <th className="px-6 py-4 text-left">Term</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedGrades.map((g, index) => (
                      <tr key={g.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center">
                              {g.studentName?.charAt(0)}
                            </div>
                            <span
                              className="font-medium text-gray-800 hover:text-blue-600 cursor-pointer"
                              onClick={() =>
                                navigate(`/admin/students/${g.studentId}`)
                              }
                            >
                              {g.studentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {g.studentClass}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{g.subject}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {g.classTest}
                        </td>
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                navigate(`/admin/grades/edit/${g.id}`)
                              }
                              className="text-blue-400 hover:text-blue-600 transition"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => confirmDelete(g.id)}
                              disabled={deletingId === g.id}
                              className="text-red-400 hover:text-red-600 transition disabled:opacity-40"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </motion.div>
          )}

          {/* By Student */}
          {view === "By Student" && (
            <GroupedView
              groupKey="studentName"
              labelKey="studentName"
              onClickRow={(g) => navigate(`/admin/students/${g.studentId}`)}
            />
          )}

          {/* By Subject */}
          {view === "By Subject" && (
            <GroupedView groupKey="subject" labelKey="subject" />
          )}

          {/* By Class */}
          {view === "By Class" && (
            <GroupedView groupKey="studentClass" labelKey="studentClass" />
          )}
        </>
      )}
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deletingId === deleteModal.id}
        title="Delete Student?"
        message="This will permanently remove the student and cannot be undone."
      />
    </div>
  );
};

export default Grades;
