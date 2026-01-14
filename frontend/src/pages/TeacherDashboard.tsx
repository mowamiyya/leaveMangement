import { Routes, Route, Navigate } from 'react-router-dom'
import TeacherLayout from '../components/TeacherLayout'
import Dashboard from '../components/teacher/Dashboard'
import Approvals from '../components/teacher/Approvals'
import History from '../components/teacher/History'
import MyChart from '../components/teacher/MyChart'
import Profile from '../components/Profile'
import Settings from '../components/Settings'

const TeacherDashboard = () => {
  return (
    <TeacherLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="history" element={<History />} />
        <Route path="hierarchy" element={<MyChart />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="" element={<Navigate to="dashboard" />} />
      </Routes>
    </TeacherLayout>
  )
}

export default TeacherDashboard
