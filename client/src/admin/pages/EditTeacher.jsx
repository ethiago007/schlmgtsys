import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { getDocument, updateDocument } from "../../firebase/firestore";
import { MdArrowBack } from "react-icons/md";
import { classes } from "../../utils/constant";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  subject: z.string().min(1, "Subject is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(1, "Address is required"),
  qualification: z.string().min(1, "Qualification is required"),
  employedDate: z.string().min(1, "Employment date is required"),
  class: z.string().min(1, "Class assignment is required"), // ← add
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((dob) => {
      const birth = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const hasBirthday =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
          today.getDate() >= birth.getDate());
      const actualAge = hasBirthday ? age : age - 1;
      return actualAge >= 21 && actualAge <= 70;
    }, "Teacher must be between 21 and 70 years old"),
});

const subjects = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Economics",
  "Civic Education",
  "Agricultural Science",
  "Computer Science",
  "French",
  "Literature",
  "Further Mathematics",
];

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const teacher = await getDocument("teachers", id);
        if (!teacher) {
          toast.error("Teacher not found");
          navigate("/admin/teachers");
          return;
        }
        reset(teacher);
      } catch (error) {
        toast.error("Failed to load teacher");
      } finally {
        setFetching(false);
      }
    };
    fetchTeacher();
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateDocument("teachers", id, data);
      toast.success("Teacher updated successfully!");
      navigate("/admin/teachers");
    } catch (error) {
      toast.error("Failed to update teacher.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error) =>
    `w-full border ${error ? "border-red-400" : "border-gray-300"} 
    rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 
    focus:ring-blue-500 transition`;

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading teacher data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/teachers")}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <MdArrowBack size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Teacher</h2>
          <p className="text-sm text-gray-500">Update teacher information</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                {...register("firstName")}
                className={inputClass(errors.firstName)}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                {...register("lastName")}
                className={inputClass(errors.lastName)}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className={inputClass(errors.email)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                {...register("phone")}
                className={inputClass(errors.phone)}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                {...register("subject")}
                className={inputClass(errors.subject)}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register("gender")}
                className={inputClass(errors.gender)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Class
              </label>
              <select
                {...register("class")}
                className={inputClass(errors.class)}
              >
                <option value="">Select class to assign</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.class && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.class.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification
              </label>
              <select
                {...register("qualification")}
                className={inputClass(errors.qualification)}
              >
                <option value="">Select qualification</option>
                <option value="B.Ed">B.Ed</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Ed">M.Ed</option>
                <option value="M.Sc">M.Sc</option>
                <option value="PGDE">PGDE</option>
                <option value="PhD">PhD</option>
              </select>
              {errors.qualification && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.qualification.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Date
              </label>
              <input
                {...register("employedDate")}
                type="date"
                className={inputClass(errors.employedDate)}
              />
              {errors.employedDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.employedDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                {...register("dateOfBirth")}
                type="date"
                className={inputClass(errors.dateOfBirth)}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                {...register("address")}
                className={inputClass(errors.address)}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/teachers")}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditTeacher;
