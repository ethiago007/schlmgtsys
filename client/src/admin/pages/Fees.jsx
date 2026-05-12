import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { MdAdd, MdDelete, MdEdit, MdSearch, MdEmail } from "react-icons/md";
import { getCollection, deleteDocument } from "../../firebase/firestore";
import { formatCurrency, feeStatuses, terms } from "../../utils/constant";
import DeleteModal from "../../shared/components/DeleteModal";
import { emailApi } from "../../utils/api";
import Pagination from "../../shared/components/Pagination";
import usePagination from "../../hooks/usePagination";
import { SkeletonTable } from "../../shared/components/Skeleton";

const statusColor = (status) => {
  const colors = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Overdue: "bg-red-100 text-red-600",
    Partial: "bg-blue-100 text-blue-600",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
};

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const deleteIdRef = useRef(null);
  const navigate = useNavigate();
  const [sendingReminders, setSendingReminders] = useState(false);

  const fetchFees = async () => {
    try {
      const data = await getCollection("fees");
      setFees(data);
      setFiltered(data);
    } catch (error) {
      toast.error("Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    let results = fees;
    if (statusFilter)
      results = results.filter((f) => f.status === statusFilter);
    if (termFilter) results = results.filter((f) => f.term === termFilter);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (f) =>
          f.studentName?.toLowerCase().includes(q) ||
          f.feeType?.toLowerCase().includes(q) ||
          f.studentClass?.toLowerCase().includes(q),
      );
    }
    setFiltered(results);
  }, [search, statusFilter, termFilter, fees]);

  const confirmDelete = (id) => {
    deleteIdRef.current = id;
    setDeleteModal({ open: true, id });
  };

  const handleDelete = async () => {
    const id = deleteIdRef.current;
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteDocument("fees", id);
      toast.success("Fee record deleted");
      setDeleteModal({ open: false, id: null });
      deleteIdRef.current = null;
      fetchFees();
    } catch (error) {
      toast.error("Failed to delete fee record");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const result = await emailApi.sendFeeReminders();
      toast.success(`${result.data.sent} fee reminders sent!`);
    } catch (error) {
      toast.error("Failed to send reminders");
    } finally {
      setSendingReminders(false);
    }
  };

  // Summary stats
  const totalCollected = fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = fees
    .filter((f) => f.status === "Pending" || f.status === "Overdue")
    .reduce((sum, f) => sum + f.amount, 0);

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedFees,
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
          <h2 className="text-2xl font-bold text-gray-800">Fees</h2>
          <p className="text-sm text-gray-500 mt-1">
            {fees.length} fee records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/fees/add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <MdAdd size={18} />
            Add Fee Record
          </button>
          <button
            onClick={handleSendReminders}
            disabled={sendingReminders}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
          >
            <MdEmail size={18} />
            {sendingReminders ? "Sending..." : "Send Fee Reminders"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-5"
        >
          <p className="text-sm text-gray-400">Total Records</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{fees.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-5"
        >
          <p className="text-sm text-gray-400">Total Collected</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {formatCurrency(totalCollected)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-5"
        >
          <p className="text-sm text-gray-400">Total Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {formatCurrency(totalPending)}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <MdSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by student, fee type or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {feeStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            <SkeletonTable rows={8} cols={9} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {search || statusFilter || termFilter
              ? "No records match your filters."
              : "No fee records yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Student</th>
                  <th className="px-6 py-4 text-left">Class</th>
                  <th className="px-6 py-4 text-left">Fee Type</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Term</th>
                  <th className="px-6 py-4 text-left">Due Date</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedFees.map((fee, index) => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center">
                          {fee.studentName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">
                          {fee.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {fee.studentClass}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{fee.feeType}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{fee.term}</td>
                    <td className="px-6 py-4 text-gray-600">{fee.dueDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(fee.status)}`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/admin/fees/edit/${fee.id}`)}
                          className="text-blue-400 hover:text-blue-600 transition"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(fee.id);
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
        title="Delete Fee Record?"
        message="This will permanently remove this fee record."
      />
    </div>
  );
};

export default Fees;
