import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./shared/pages/Login";
import AdminLayout from "./admin/components/AdminLayout";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import Dashboard from "./admin/pages/Dashboard";
import Students from "./admin/pages/Students";
import AddStudent from "./admin/pages/AddStudent";
import EditStudent from "./admin/pages/EditStudent";
import Teachers from "./admin/pages/Teachers";
import AddTeacher from "./admin/pages/AddTeacher";
import EditTeacher from "./admin/pages/EditTeacher";
import Classes from "./admin/pages/Classes";
import AddClass from "./admin/pages/AddClass";
import EditClass from "./admin/pages/EditClass";
import Grades from "./admin/pages/Grades";
import AddGrade from "./admin/pages/AddGrade";
import EditGrade from "./admin/pages/EditGrade";
import StudentProfile from "./admin/pages/StudentProfile";
import Attendance from "./admin/pages/Attendance";
import Fees from "./admin/pages/Fees";
import AddFee from "./admin/pages/AddFee";
import EditFee from "./admin/pages/EditFee";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/add" element={<AddStudent />} />
          <Route path="students/edit/:id" element={<EditStudent />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="teachers/add" element={<AddTeacher />} />
          <Route path="teachers/edit/:id" element={<EditTeacher />} />
          <Route path="classes" element={<Classes />} />
          <Route path="classes/add" element={<AddClass />} />
          <Route path="classes/edit/:id" element={<EditClass />} />
          <Route path="grades" element={<Grades />} />
          <Route path="grades/add" element={<AddGrade />} />
          <Route path="grades/edit/:id" element={<EditGrade />} />
          <Route path="students/:id" element={<StudentProfile />} />+
          <Route path="attendance" element={<Attendance />} />
          <Route path="fees" element={<Fees />} />
          <Route path="fees/add" element={<AddFee />} />
          <Route path="fees/edit/:id" element={<EditFee />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
