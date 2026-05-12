// Grade boundaries
export const getGrade = (score) => {
  if (score >= 70) return { grade: "A", remark: "Excellent" };
  if (score >= 60) return { grade: "B", remark: "Very Good" };
  if (score >= 50) return { grade: "C", remark: "Good" };
  if (score >= 45) return { grade: "D", remark: "Pass" };
  if (score >= 40) return { grade: "E", remark: "Poor" };
  return { grade: "F", remark: "Fail" };
};

export const gradeColor = (grade) => {
  const colors = {
    A: "bg-green-100 text-green-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-yellow-100 text-yellow-700",
    D: "bg-orange-100 text-orange-700",
    E: "bg-red-100 text-red-700",
    F: "bg-red-200 text-red-800",
  };
  return colors[grade] || "bg-gray-100 text-gray-700";
};

export const terms = ["First Term", "Second Term", "Third Term"];
export const sessions = ["2023/2024", "2024/2025", "2025/2026"];
export const classes = ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"];
export const subjects = [
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

export const feeTypes = [
  "School Fees",
  "Exam Fees",
  "Library Fees",
  "Sports Fees",
  "Lab Fees",
  "PTA Levy",
  "Development Levy",
];

export const feeStatuses = ["Pending", "Paid", "Overdue", "Partial"];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Normal age range per class + allowance for special cases
export const classAgeRules = {
  JSS1: { min: 9, max: 13, label: "JSS1 (Expected: 9–13)" },
  JSS2: { min: 10, max: 14, label: "JSS2 (Expected: 10–14)" },
  JSS3: { min: 11, max: 15, label: "JSS3 (Expected: 11–15)" },
  SSS1: { min: 14, max: 18, label: "SSS1 (Expected: 14–18)" },
  SSS2: { min: 15, max: 19, label: "SSS2 (Expected: 15–19)" },
  SSS3: { min: 16, max: 20, label: "SSS3 (Expected: 16–20)" },
};

// Special case allowance — how many extra years on each side we allow
export const SPECIAL_CASE_ALLOWANCE = 4;

export const validateStudentAge = (dob, className, isSpecialCase = false) => {
  if (!dob || !className) return { valid: true, message: "" };

  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  if (!hasBirthday) age -= 1;

  const rule = classAgeRules[className];
  if (!rule) return { valid: true, message: "" };

  const minAge = isSpecialCase ? rule.min - SPECIAL_CASE_ALLOWANCE : rule.min;
  const maxAge = isSpecialCase ? rule.max + SPECIAL_CASE_ALLOWANCE : rule.max;

  if (age < minAge) {
    return {
      valid: false,
      age,
      message: isSpecialCase
        ? `Student is ${age} years old. Even with special case allowance, minimum age for ${className} is ${minAge}.`
        : `Student is ${age} years old. Minimum age for ${className} is ${rule.min}. Enable special case if this is intentional.`,
    };
  }

  if (age > maxAge) {
    return {
      valid: false,
      age,
      message: isSpecialCase
        ? `Student is ${age} years old. Even with special case allowance, maximum age for ${className} is ${maxAge}.`
        : `Student is ${age} years old. Maximum age for ${className} is ${rule.max}. Enable special case if this is a late education situation.`,
    };
  }

  return {
    valid: true,
    age,
    message: isSpecialCase
      ? `Age ${age} accepted under special case allowance for ${className}.`
      : `Age ${age} is within the normal range for ${className}.`,
  };
};
