import { Routes, Route, Navigate } from 'react-router-dom'
import StudentLayout from '../components/StudentLayout'
import Dashboard from '../components/student/Dashboard'
import MyLeaves from '../components/student/MyLeaves'
import MyChart from '../components/student/MyChart'
import Profile from '../components/Profile'
import Settings from '../components/Settings'

const StudentDashboard = () => {
  return (
    <StudentLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-leaves" element={<MyLeaves />} />
        <Route path="my-chart" element={<MyChart />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="" element={<Navigate to="dashboard" />} />
      </Routes>
    </StudentLayout>
  )
}

export default StudentDashboard
