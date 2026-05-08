import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdPersonAdd, MdDelete, MdSearch, MdEdit } from "react-icons/md";
import { getCollection, deleteDocument } from "../../firebase/firestore";
import DeleteModal from "../../shared/components/DeleteModal";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();

  // Fetch students
  const fetchStudents = async () => {
    try {
      const data = await getCollection("students");
      setStudents(data);
      setFiltered(data);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    const results = students.filter(
      (s) =>
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.class?.toLowerCase().includes(q),
    );
    setFiltered(results);
  }, [search, students]);

  // Delete student
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
      await deleteDocument("students", id); // ← use captured id
      toast.success("Student deleted");
      setDeleteModal({ open: false, id: null });
      fetchStudents();
    } catch (error) {
      console.error("Delete error:", error.code, error.message);
      toast.error("Failed to delete student");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Students</h2>
          <p className="text-sm text-gray-500 mt-1">
            {students.length} students registered
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/students/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdPersonAdd size={18} />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MdSearch
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name, email or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Loading students...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {search
              ? "No students match your search."
              : "No students yet. Add your first one!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Class</th>
                  <th className="px-6 py-4 text-left">Gender</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Phone</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    {/* Index */}
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>

                    {/* Name + Avatar */}
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/students/${student.id}`)
                        }
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex items-center justify-center">
                          {student.firstName?.charAt(0)}
                          {student.lastName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800 hover:text-blue-600 transition">
                          {student.firstName} {student.lastName}
                        </span>
                        {student.isSpecialCase && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                            Special
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">{student.class}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-gray-600">{student.phone}</td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full capitalize">
                        {student.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            navigate(`/admin/students/edit/${student.id}`)
                          }
                          className="text-blue-400 hover:text-blue-600 transition"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(student.id)}
                          disabled={deletingId === student.id}
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
        )}
      </motion.div>
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

export default Students;
