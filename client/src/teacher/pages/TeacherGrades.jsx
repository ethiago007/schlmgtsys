import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import {
  getCollection,
  deleteDocument,
  getStudentsByClass,
} from "../../firebase/firestore";
import { gradeColor, terms } from "../../utils/constant";
import { useAuth } from "../../context/AuthContext";
import DeleteModal from "../../shared/components/DeleteModal";
import { SkeletonTable } from "../../shared/components/Skeleton";
import { SkeletonCard } from "../../shared/components/Skeleton";

const TeacherGrades = () => {
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const deleteIdRef = useRef(null);

  const fetchGrades = async () => {
    try {
      const allGrades = await getCollection("grades");
      // Teachers only see grades for their subject
      const myGrades = allGrades.filter((g) => g.subject === teacher?.subject);
      setGrades(myGrades);
      setFiltered(myGrades);
    } catch (error) {
      toast.error("Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teacher) return;
    fetchGrades();
  }, [teacher]);

  useEffect(() => {
    let results = grades;
    if (termFilter) results = results.filter((g) => g.term === termFilter);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (g) =>
          g.studentName?.toLowerCase().includes(q) ||
          g.studentClass?.toLowerCase().includes(q),
      );
    }
    setFiltered(results);
  }, [search, termFilter, grades]);

  const confirmDelete = (id) => {
    deleteIdRef.current = id;
    setDeleteModal({ open: true, id });
  };

  const handleDelete = async () => {
    const id = deleteIdRef.current;
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteDocument("grades", id);
      toast.success("Grade deleted");
      setDeleteModal({ open: false, id: null });
      deleteIdRef.current = null;
      fetchGrades();
    } catch (error) {
      toast.error("Failed to delete grade");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Grades</h2>
          <p className="text-sm text-gray-500 mt-1">
            {teacher?.subject} · {grades.length} records
          </p>
        </div>
        <button
          onClick={() => navigate("/teacher/grades/add")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdAdd size={18} />
          Record Grade
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MdSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by student or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Terms</option>
          {terms.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <SkeletonTable rows={6} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {search || termFilter
              ? "No grades match your filters."
              : "No grades recorded yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Student</th>
                  <th className="px-6 py-4 text-left">Class</th>
                  <th className="px-6 py-4 text-left">C.Test</th>
                  <th className="px-6 py-4 text-left">Mid Term</th>
                  <th className="px-6 py-4 text-left">Exam</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Grade</th>
                  <th className="px-6 py-4 text-left">Term</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((g, index) => (
                  <tr key={g.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {g.studentName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {g.studentClass}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{g.classTest}</td>
                    <td className="px-6 py-4 text-gray-600">{g.midTerm}</td>
                    <td className="px-6 py-4 text-gray-600">{g.exam}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {g.total}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${gradeColor(g.grade)}`}
                      >
                        {g.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{g.term}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            navigate(`/teacher/grades/edit/${g.id}`)
                          }
                          className="text-blue-400 hover:text-blue-600 transition"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(g.id);
                          }}
                          className="text-red-400 hover:text-red-600 transition"
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
        )}
      </motion.div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deletingId === deleteModal.id}
        title="Delete Grade?"
        message="This will permanently remove this grade record."
      />
    </div>
  );
};

export default TeacherGrades;
