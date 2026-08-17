import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeLeaveRequest from './pages/employee/LeaveRequest'
import EmployeeAttendance from './pages/employee/AttendanceHistory'
import ManagerDashboard from './pages/manager/Dashboard'
import ManagerLeaveRequest from './pages/manager/LeaveRequest'
import ManagerLeaveApproval from './pages/manager/LeaveApproval'
import ManagerAttendance from './pages/manager/AttendanceHistory'
import ManagerEmployees from './pages/manager/AssignedEmployees'
import HRDashboard from './pages/hr/Dashboard'
import HRAddUser from './pages/hr/AddUser'
import HRAllAttendance from './pages/hr/AllAttendance'
import HRLeaveApproval from './pages/hr/LeaveApproval'
import HRUserList from './pages/hr/UserList'
import HRExport from './pages/hr/ExportAttendance'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/employee/dashboard" element={<PrivateRoute role="employee"><EmployeeDashboard /></PrivateRoute>} />
      <Route path="/employee/leave-request" element={<PrivateRoute role="employee"><EmployeeLeaveRequest /></PrivateRoute>} />
      <Route path="/employee/attendance" element={<PrivateRoute role="employee"><EmployeeAttendance /></PrivateRoute>} />

      <Route path="/manager/dashboard" element={<PrivateRoute role="manager"><ManagerDashboard /></PrivateRoute>} />
      <Route path="/manager/leave-request" element={<PrivateRoute role="manager"><ManagerLeaveRequest /></PrivateRoute>} />
      <Route path="/manager/leave-approval" element={<PrivateRoute role="manager"><ManagerLeaveApproval /></PrivateRoute>} />
      <Route path="/manager/attendance" element={<PrivateRoute role="manager"><ManagerAttendance /></PrivateRoute>} />
      <Route path="/manager/employees" element={<PrivateRoute role="manager"><ManagerEmployees /></PrivateRoute>} />

      <Route path="/hr/dashboard" element={<PrivateRoute role="hr"><HRDashboard /></PrivateRoute>} />
      <Route path="/hr/add-user" element={<PrivateRoute role="hr"><HRAddUser /></PrivateRoute>} />
      <Route path="/hr/attendance" element={<PrivateRoute role="hr"><HRAllAttendance /></PrivateRoute>} />
      <Route path="/hr/leave-approval" element={<PrivateRoute role="hr"><HRLeaveApproval /></PrivateRoute>} />
      <Route path="/hr/users" element={<PrivateRoute role="hr"><HRUserList /></PrivateRoute>} />
      <Route path="/hr/export" element={<PrivateRoute role="hr"><HRExport /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
