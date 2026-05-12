import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdAdd, MdDelete, MdSearch, MdClass, MdEdit } from "react-icons/md";
import { getCollection, deleteDocument } from "../../firebase/firestore";
import DeleteModal from "../../shared/components/DeleteModal";
import Pagination from "../../shared/components/Pagination";
import usePagination from "../../hooks/usePagination";
import { SkeletonTable } from "../../shared/components/Skeleton";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      const data = await getCollection("classes");
      setClasses(data);
      setFiltered(data);
    } catch (error) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const results = classes.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.teacherName?.toLowerCase().includes(q) ||
        c.term?.toLowerCase().includes(q) ||
        c.session?.toLowerCase().includes(q),
    );
    setFiltered(results);
  }, [search, classes]);

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

  // Color per class name for the badge
  const classBadgeColor = (name) => {
    const colors = {
      JSS1: "bg-blue-100 text-blue-700",
      JSS2: "bg-indigo-100 text-indigo-700",
      JSS3: "bg-purple-100 text-purple-700",
      SSS1: "bg-green-100 text-green-700",
      SSS2: "bg-yellow-100 text-yellow-700",
      SSS3: "bg-red-100 text-red-700",
    };
    return colors[name] || "bg-gray-100 text-gray-700";
  };

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedClass,
    setCurrentPage,
    resetPage,
    totalItems,
    itemsPerPage,
  } = usePagination(filtered, 10);

  // Reset page when search changes
  useEffect(() => {
    resetPage();
  }, [search]);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Classes</h2>
          <p className="text-sm text-gray-500 mt-1">
            {classes.length} classes available
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/classes/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <MdAdd size={18} />
          Add Class
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
          placeholder="Search by class, teacher or term..."
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
            <SkeletonTable rows={8} cols={7} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <MdClass size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {search
                ? "No classes match your search."
                : "No classes yet. Create your first one!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Class</th>
                  <th className="px-6 py-4 text-left">Class Teacher</th>
                  <th className="px-6 py-4 text-left">Room</th>
                  <th className="px-6 py-4 text-left">Capacity</th>
                  <th className="px-6 py-4 text-left">Term</th>
                  <th className="px-6 py-4 text-left">Session</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedClass.map((cls, index) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>

                    {/* Class Name Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${classBadgeColor(cls.name)}`}
                      >
                        {cls.name}
                      </span>
                    </td>

                    {/* Teacher */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 text-xs font-semibold flex items-center justify-center">
                          {cls.teacherName?.charAt(0)}
                        </div>
                        <span className="text-gray-700">{cls.teacherName}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">{cls.room}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {cls.capacity} students
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cls.term}</td>
                    <td className="px-6 py-4 text-gray-600">{cls.session}</td>

                    {/* Delete */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            navigate(`/admin/classes/edit/${cls.id}`)
                          }
                          className="text-blue-400 hover:text-blue-600 transition"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(cls.id)}
                          disabled={deletingId === cls.id}
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

export default Classes;
