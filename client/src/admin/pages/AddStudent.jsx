import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { addDocument } from "../../firebase/firestore";
import {
  classes,
  classAgeRules,
  validateStudentAge,
} from "../../utils/constant";
import {
  MdArrowBack,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfoOutline,
} from "react-icons/md";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  class: z.string().min(1, "Class is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
});

const AddStudent = () => {
  const [loading, setLoading] = useState(false);
  const [isSpecialCase, setIsSpecialCase] = useState(false);
  const [ageValidation, setAgeValidation] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const watchedDob = watch("dateOfBirth");
  const watchedClass = watch("class");

  // Live age validation as they type
  useEffect(() => {
    if (watchedDob && watchedClass) {
      const result = validateStudentAge(
        watchedDob,
        watchedClass,
        isSpecialCase,
      );
      setAgeValidation(result);
    } else {
      setAgeValidation(null);
    }
  }, [watchedDob, watchedClass, isSpecialCase]);

  const onSubmit = async (data) => {
    // Final age check before saving
    const ageCheck = validateStudentAge(
      data.dateOfBirth,
      data.class,
      isSpecialCase,
    );
    if (!ageCheck.valid) {
      toast.error(ageCheck.message);
      return;
    }

    setLoading(true);
    try {
      await addDocument("students", {
        ...data,
        status: "active",
        isSpecialCase,
        age: ageCheck.age,
      });
      toast.success("Student added successfully!");
      reset();
      try {
        await emailApi.sendGradeNotification({
          studentId: data.studentId,
          subject: teacher?.subject || data.subject,
          grade,
          total,
          term: data.term,
          session: data.session,
        });
      } catch (emailError) {
        // Don't fail the whole operation if email fails
        console.warn("Grade email failed:", emailError);
      }
      setIsSpecialCase(false);
      setAgeValidation(null);
      navigate("/admin/students");
    } catch (error) {
      toast.error("Failed to add student.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error) =>
    `w-full border ${error ? "border-red-400" : "border-gray-300"} 
    rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 
    focus:ring-blue-500 transition`;

  // Age validation banner styles
  const ageBanner =
    ageValidation &&
    {
      valid: {
        bg: isSpecialCase
          ? "bg-yellow-50 border-yellow-200"
          : "bg-green-50 border-green-200",
        text: isSpecialCase ? "text-yellow-700" : "text-green-700",
        icon: isSpecialCase ? (
          <MdWarning size={18} />
        ) : (
          <MdCheckCircle size={18} />
        ),
      },
      invalid: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-600",
        icon: <MdError size={18} />,
      },
    }[ageValidation.valid ? "valid" : "invalid"];

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/students")}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <MdArrowBack size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Student</h2>
          <p className="text-sm text-gray-500">
            Fill in the details below to register a new student
          </p>
        </div>
      </div>

      {/* Age brackets info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-2">
          <MdInfoOutline size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700">
              Class Age Brackets
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {Object.entries(classAgeRules).map(([cls, rule]) => (
                <span key={cls} className="text-xs text-blue-600">
                  {cls}: {rule.min}–{rule.max} yrs
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                {...register("firstName")}
                className={inputClass(errors.firstName)}
                placeholder="John"
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
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className={inputClass(errors.email)}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                {...register("phone")}
                className={inputClass(errors.phone)}
                placeholder="08012345678"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Class & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                {...register("class")}
                className={inputClass(errors.class)}
              >
                <option value="">Select class</option>
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
          </div>

          {/* DOB & Address */}
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
                placeholder="123 Main St, Lagos"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          {/* Live Age Validation Banner */}
          <AnimatePresence>
            {ageValidation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${ageBanner.bg}`}
              >
                <span className={ageBanner.text}>{ageBanner.icon}</span>
                <p className={`text-sm ${ageBanner.text}`}>
                  {ageValidation.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Special Case Toggle */}
          {/* Only show toggle if age is out of range OR already a special case */}
          {(ageValidation && !ageValidation.valid) || isSpecialCase ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800">
                    Special Case Admission
                  </p>
                  <p className="text-xs text-yellow-600 mt-0.5">
                    Enable this for late education, early gifted students, or
                    other exceptional circumstances. Extends age limit by {4}{" "}
                    years on each side.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpecialCase(!isSpecialCase)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                    isSpecialCase ? "bg-yellow-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      isSpecialCase ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </motion.div>
            </AnimatePresence>
          ) : null}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/students")}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Student"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddStudent;
