import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './shared/pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


// import { BrowserRouter, Routes, Route } from 'react-router-dom'

// // Layouts
// import AdminLayout from './admin/components/AdminLayout'
// import PortalLayout from './client/components/PortalLayout'
// import ProtectedRoute from './shared/components/ProtectedRoute'

// // Shared
// import Login from './shared/pages/Login'
// import NotFound from './shared/pages/NotFound'

// // Admin pages
// import Dashboard from './admin/pages/Dashboard'
// import Students from './admin/pages/Students'
// import Teachers from './admin/pages/Teachers'

// // Client pages
// import Home from './client/pages/Home'
// import MyGrades from './client/pages/MyGrades'

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Public */}
//         <Route path="/login" element={<Login />} />

//         {/* Admin - protected */}
//         <Route path="/admin" element={
//           <ProtectedRoute role="admin">
//             <AdminLayout />
//           </ProtectedRoute>
//         }>
//           <Route index element={<Dashboard />} />
//           <Route path="students" element={<Students />} />
//           <Route path="teachers" element={<Teachers />} />
//         </Route>

//         {/* Student Portal - protected */}
//         <Route path="/portal" element={
//           <ProtectedRoute role="student">
//             <PortalLayout />
//           </ProtectedRoute>
//         }>
//           <Route index element={<Home />} />
//           <Route path="grades" element={<MyGrades />} />
//         </Route>

//         {/* 404 */}
//         <Route path="*" element={<NotFound />} />

//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App