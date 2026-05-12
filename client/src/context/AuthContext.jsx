import { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange, getUserRole } from "../firebase/auth";
import { db } from "../firebase/firebase.config";
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null); // ← add teacher
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userRole = await getUserRole(firebaseUser.uid);
        setUser(firebaseUser);
        setRole(userRole);

        if (userRole === "student") {
          try {
            const q = query(
              collection(db, "students"),
              where("email", "==", firebaseUser.email),
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setStudent({
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data(),
              });
            }
          } catch (error) {
            console.error("Failed to fetch student record", error);
          }
        }

        if (userRole === "teacher") {
          try {
            const q = query(
              collection(db, "teachers"),
              where("email", "==", firebaseUser.email),
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setTeacher({
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data(),
              });
            }
          } catch (error) {
            console.error("Failed to fetch teacher record", error);
          }
        }
      } else {
        setUser(null);
        setRole(null);
        setStudent(null);
        setTeacher(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, student, teacher, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
