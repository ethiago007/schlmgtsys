import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { addDocument, getStudentsByClass } from "../../firebase/firestore";
import { getGrade, terms, sessions } from "../../utils/constant";
import { useAuth } from "../../context/AuthContext";
import { MdArrowBack } from "react-icons/md";

const schema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  term: z.string().min(1, "Please select a term"),
  session: z.string().min(1, "Please select a session"),
  classTest: z.string().min(1, "Class test score is required"),
  midTerm: z.string().min(1, "Mid term score is required"),
  exam: z.string().min(1, "Exam score is required"),
});

const AddTeacherGrade = () => {
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const classTest = watch("classTest");
  const midTerm = watch("midTerm");
  const exam = watch("exam");

  useEffect(() => {
    if (!teacher?.class) return;
    const fetchStudents = async () => {
      try {
        const data = await getStudentsByClass(teacher.class);
        setStudents(data);
      } catch (error) {
        toast.error("Failed to load students");
      }
    };
    fetchStudents();
  }, [teacher]);

  useEffect(() => {
    const ct = parseFloat(classTest) || 0;
    const mt = parseFloat(midTerm) || 0;
    const ex = parseFloat(exam) || 0;
    if (ct > 0 || mt > 0 || ex > 0) {
      const total = ct + mt + ex;
      const { grade, remark } = getGrade(total);
      setPreview({ total, grade, remark });
    } else {
      setPreview(null);
    }
  }, [classTest, midTerm, exam]);

  const onSubmit = async (data) => {
    if (parseFloat(data.classTest) > 20)
      return toast.error("Class test max is 20");
    if (parseFloat(data.midTerm) > 20) return toast.error("Mid term max is 20");
    if (parseFloat(data.exam) > 60) return toast.error("Exam max is 60");

    setLoading(true);
    try {
      const selectedStudent = students.find((s) => s.id === data.studentId);
      const total =
        parseFloat(data.classTest) +
        parseFloat(data.midTerm) +
        parseFloat(data.exam);
      const { grade, remark } = getGrade(total);

      await addDocument("grades", {
        ...data,
        subject: teacher.subject, // ← auto-filled from teacher
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        studentClass: selectedStudent.class,
        total,
        grade,
        remark,
        classTest: parseFloat(data.classTest),
        midTerm: parseFloat(data.midTerm),
        exam: parseFloat(data.exam),
        recordedBy: `${teacher.firstName} ${teacher.lastName}`,
      });

      toast.success("Grade recorded!");
      reset();
      setPreview(null);
      navigate("/teacher/grades");
    } catch (error) {
      toast.error("Failed to record grade.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error) =>
    `w-full border ${error ? "border-red-400" : "border-gray-300"} 
    rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 
    focus:ring-green-500 transition`;

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/teacher/grades")}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <MdArrowBack size={22} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Record Grade</h2>
          <p className="text-sm text-gray-500">
            Subject:{" "}
            <span className="font-semibold text-green-600">
              {teacher?.subject}
            </span>
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              {...register("studentId")}
              className={inputClass(errors.studentId)}
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.studentId.message}
              </p>
            )}
          </div>

          {/* Term & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term
              </label>
              <select {...register("term")} className={inputClass(errors.term)}>
                <option value="">Select term</option>
                {terms.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.term && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.term.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session
              </label>
              <select
                {...register("session")}
                className={inputClass(errors.session)}
              >
                <option value="">Select session</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.session && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.session.message}
                </p>
              )}
            </div>
          </div>

          {/* Scores */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Scores
              <span className="text-gray-400 font-normal ml-2">
                (C.Test /20 · Mid Term /20 · Exam /60)
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Class Test (max 20)
                </label>
                <input
                  {...register("classTest")}
                  type="number"
                  min="0"
                  max="20"
                  className={inputClass(errors.classTest)}
                  placeholder="0"
                />
                {errors.classTest && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.classTest.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Mid Term (max 20)
                </label>
                <input
                  {...register("midTerm")}
                  type="number"
                  min="0"
                  max="20"
                  className={inputClass(errors.midTerm)}
                  placeholder="0"
                />
                {errors.midTerm && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.midTerm.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Exam (max 60)
                </label>
                <input
                  {...register("exam")}
                  type="number"
                  min="0"
                  max="60"
                  className={inputClass(errors.exam)}
                  placeholder="0"
                />
                {errors.exam && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.exam.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="text-center">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  {preview.total}
                  <span className="text-sm text-gray-400">/100</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Grade</p>
                <p className="text-2xl font-bold text-green-600">
                  {preview.grade}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Remark</p>
                <p className="text-sm font-semibold text-gray-700">
                  {preview.remark}
                </p>
              </div>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/teacher/grades")}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Record Grade"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTeacherGrade;
