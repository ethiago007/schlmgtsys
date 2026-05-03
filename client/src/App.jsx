import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './shared/pages/Login'
import AdminLayout from './admin/components/AdminLayout'
import ProtectedRoute from './shared/components/ProtectedRoute'
import Dashboard from './admin/pages/Dashboard'
import Students from './admin/pages/Students'
import AddStudent from './admin/pages/AddStudent'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/add" element={<AddStudent />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App