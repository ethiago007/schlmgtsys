import { motion } from "framer-motion";

const StatCard = ({ label, value, icon, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5"
    >
      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl ${color}`}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-0.5">
          {value ?? <span className="text-gray-300 text-xl">Loading...</span>}
        </h3>
      </div>
    </motion.div>
  );
};

export default StatCard;
