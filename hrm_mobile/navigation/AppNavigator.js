import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import Dashboard from '../screens/employee/Dashboard';
import LeaveRequest from '../screens/employee/LeaveRequest';
import AttendanceHistory from '../screens/employee/AttendanceHistory';

import HRDashboard from '../screens/hr/HRDashboard';
import AddUser from '../screens/hr/AddUser';
import AllAttendance from '../screens/hr/AllAttendance';
import HRLeaveApproval from '../screens/hr/HRLeaveApproval';
import UserList from '../screens/hr/UserList';

import ManagerDashboard from '../screens/manager/ManagerDashboard';
import ManagerLeaveApproval from '../screens/manager/ManagerLeaveApproval';
import AssignedEmployees from '../screens/manager/AssignedEmployees';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { role } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {!role ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : role === 'employee' ? (
        <>
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="LeaveRequest" component={LeaveRequest} />
          <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
        </>
      ) : role === 'manager' ? (
        <>
          <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
          {/* Managers request leave and view their own attendance with the same
              screens employees use — they were previously duplicated verbatim. */}
          <Stack.Screen name="LeaveRequest" component={LeaveRequest} />
          <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
          <Stack.Screen name="ManagerLeaveApproval" component={ManagerLeaveApproval} />
          <Stack.Screen name="AssignedEmployees" component={AssignedEmployees} />
        </>
      ) : (
        <>
          <Stack.Screen name="HRDashboard" component={HRDashboard} />
          <Stack.Screen name="AddUser" component={AddUser} />
          <Stack.Screen name="AllAttendance" component={AllAttendance} />
          <Stack.Screen name="UserList" component={UserList} />
          <Stack.Screen name="HRLeaveApproval" component={HRLeaveApproval} />
        </>
      )}
    </Stack.Navigator>
  );
}
