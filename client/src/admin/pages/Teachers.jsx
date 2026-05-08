import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdPersonAdd, MdDelete, MdSearch, MdEdit } from "react-icons/md";
import { getCollection, deleteDocument } from "../../firebase/firestore";
import DeleteModal from '../../shared/components/DeleteModal'

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    try {
      const data = await getCollection("teachers");
      setTeachers(data);
      setFiltered(data);
    } catch (error) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const results = teachers.filter(
      (t) =>
        t.firstName?.toLowerCase().includes(q) ||
        t.lastName?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q),
    );
    setFiltered(results);
  }, [search, teachers]);

const confirmDelete = (id) => {
  setDeleteModal({ open: true, id })
}

  // Actually deletes when user confirms in modal
const handleDelete = async () => {
  const id = deleteModal.id  // ← capture it first before anything async runs

  if (!id) {
    toast.error('No record selected')
    return
  }

  setDeletingId(id)
  try {
    await deleteDocument('teachers', id)  // ← use captured id
    toast.success('Teacher deleted')
    setDeleteModal({ open: false, id: null })
    fetchTeachers()
  } catch (error) {
    console.error('Delete error:', error.code, error.message)
    toast.error('Failed to delete teacher')
  } finally {
    setDeletingId(null)
  }
}

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teachers</h2>
          <p className="text-sm text-gray-500 mt-1">
            {teachers.length} teachers registered
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/teachers/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdPersonAdd size={18} />
          Add Teacher
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
          placeholder="Search by name, email or subject..."
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
            Loading teachers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {search
              ? "No teachers match your search."
              : "No teachers yet. Add your first one!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Subject</th>
                  <th className="px-6 py-4 text-left">Gender</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Phone</th>
                  <th className="px-6 py-4 text-left">Qualification</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((teacher, index) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>

                    {/* Name + Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-xs flex items-center justify-center">
                          {teacher.firstName?.charAt(0)}
                          {teacher.lastName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {teacher.subject}
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {teacher.gender}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{teacher.email}</td>
                    <td className="px-6 py-4 text-gray-600">{teacher.phone}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {teacher.qualification}
                    </td>

                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full capitalize">
                        {teacher.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            navigate(`/admin/teachers/edit/${teacher.id}`)
                          }
                          className="text-blue-400 hover:text-blue-600 transition"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(teacher.id)}
                          disabled={deletingId === teacher.id}
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

export default Teachers;
