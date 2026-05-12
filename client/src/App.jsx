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
import PortalLayout from "./client/components/PortalLayout";
import Home from "./client/pages/Home";
import MyGrades from "./client/pages/MyGrades";
import MyAttendance from "./client/pages/MyAttendance";
import MyFees from "./client/pages/MyFees";
import Profile from "./client/pages/Profiles";
import TeacherLayout from "./teacher/components/TeacherLayout";
import TeacherHome from "./teacher/pages/Home";
import MyClass from "./teacher/pages/MyClass";
import TeacherGrades from "./teacher/pages/TeacherGrades";
import AddTeacherGrade from "./teacher/pages/AddTeacherGrade";
import TeacherAttendance from "./teacher/pages/TeacherAttendance";
import TeacherProfile from "./teacher/pages/TeacherProfile";
import AdminMessages from "./admin/pages/Messages";
import StudentMessages from "./client/pages/Messages";
import TeacherMessages from "./teacher/pages/TeacherMessages";

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
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        <Route
          path="/portal"
          element={
            <ProtectedRoute role="student">
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="grades" element={<MyGrades />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="fees" element={<MyFees />} />
          <Route path="profile" element={<Profile />} />
          <Route path="messages" element={<StudentMessages />} />
        </Route>

        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherHome />} />
          <Route path="class" element={<MyClass />} />
          <Route path="grades" element={<TeacherGrades />} />
          <Route path="grades/add" element={<AddTeacherGrade />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="messages" element={<TeacherMessages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
