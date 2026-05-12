import { auth } from "../firebase/firebase.config";

export const downloadReportCard = async (
  studentId,
  term,
  session,
  studentName,
) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const response = await fetch(
      `${apiUrl}/api/report-card/${studentId}?term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate report card");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report-Card-${studentName}-${term}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    throw error;
  }
};
