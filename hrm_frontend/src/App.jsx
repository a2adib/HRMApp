import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

// Authentication
import Login from './pages/Login'

// Shared
import NotificationsView from './pages/NotificationsView'

// HR Management Views
import HRDashboard from './pages/hr/HRDashboard'
import EmployeeList from './pages/hr/EmployeeList'
import EmployeeDetails from './pages/hr/EmployeeDetails'
import AttendanceOverview from './pages/hr/AttendanceOverview'
import AttendanceCorrections from './pages/hr/AttendanceCorrections'
import LeaveManagement from './pages/hr/LeaveManagement'
import DepartmentsView from './pages/hr/DepartmentsView'
import ShiftsView from './pages/hr/ShiftsView'
import HolidaysView from './pages/hr/HolidaysView'
import ReportsView from './pages/hr/ReportsView'
import WiFiSettingsView from './pages/hr/WiFiSettingsView'
import SettingsView from './pages/hr/SettingsView'
import UserManagementView from './pages/hr/UserManagementView'

// Manager Views
import ManagerDashboard from './pages/manager/ManagerDashboard'

// Employee Portal Views
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeAttendance from './pages/employee/EmployeeAttendance'
import EmployeeLeaves from './pages/employee/EmployeeLeaves'
import EmployeeProfile from './pages/employee/EmployeeProfile'

function RootRedirect() {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (!user && !localStorage.getItem('access_token')) {
    return <Navigate to="/login" replace />
  }
  const currentRole = (role || user?.role || 'EMPLOYEE').toUpperCase()
  if (currentRole === 'HR' || currentRole === 'HR_ADMIN' || currentRole === 'SUPER_ADMIN') {
    return <Navigate to="/hr/dashboard" replace />
  }
  if (currentRole === 'MANAGER') {
    return <Navigate to="/manager/dashboard" replace />
  }
  return <Navigate to="/employee/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<Login />} />

      {/* Root Dynamic Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* HR Executive & Administration Routes */}
      <Route
        path="/hr/dashboard"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <HRDashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <EmployeeList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/employees/:id"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <EmployeeDetails />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/attendance"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <AttendanceOverview />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/attendance-corrections"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <AttendanceCorrections />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/leaves"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <LeaveManagement />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/departments"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <DepartmentsView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/shifts"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <ShiftsView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/holidays"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <HolidaysView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/reports"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <ReportsView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/wifi-settings"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <WiFiSettingsView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/settings"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <SettingsView />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/users"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <UserManagementView defaultTab="users" />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/hr/audit-logs"
        element={
          <PrivateRoute allowedRoles={['HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <UserManagementView defaultTab="audit" />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Manager Team Routes */}
      <Route
        path="/manager/dashboard"
        element={
          <PrivateRoute allowedRoles={['MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <ManagerDashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/employees"
        element={
          <PrivateRoute allowedRoles={['MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <EmployeeList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/attendance"
        element={
          <PrivateRoute allowedRoles={['MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <AttendanceOverview />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/leave-approvals"
        element={
          <PrivateRoute allowedRoles={['MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <LeaveManagement />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/attendance-corrections"
        element={
          <PrivateRoute allowedRoles={['MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <AttendanceCorrections />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Employee Self-Service Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <EmployeeDashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <EmployeeAttendance />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <EmployeeLeaves />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <EmployeeProfile />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Shared Communications */}
      <Route
        path="/notifications"
        element={
          <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'HR', 'HR_ADMIN', 'SUPER_ADMIN']}>
            <Layout>
              <NotificationsView />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
