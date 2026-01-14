import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import Dashboard from '../components/admin/Dashboard'
import Departments from '../components/admin/Departments'
import Classes from '../components/admin/Classes'
import Teachers from '../components/admin/Teachers'
import Students from '../components/admin/Students'
import ClassTeachers from '../components/admin/ClassTeachers'
import Profile from '../components/Profile'
import Settings from '../components/Settings'

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="departments" element={<Departments />} />
        <Route path="classes" element={<Classes />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="students" element={<Students />} />
        <Route path="class-teachers" element={<ClassTeachers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="" element={<Navigate to="dashboard" />} />
      </Routes>
    </AdminLayout>
  )
}

export default AdminDashboard
