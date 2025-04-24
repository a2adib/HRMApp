import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Screens...
import LoginScreen from '../screens/auth/LoginScreen';
import Dashboard from '../screens/employee/Dashboard';
import LeaveRequest from '../screens/employee/LeaveRequest';
import AttendanceHistory from '../screens/employee/AttendanceHistory';

import HRDashboard from '../screens/hr/HRDashboard';
import AddUser from '../screens/hr/AddUser';
import AllAttendance from '../screens/hr/AllAttendance';
import HRLeaveApproval from '../screens/hr/HRLeaveApproval';

import ManagerDashboard from '../screens/manager/ManagerDashboard';
import ManagerLeaveRequest from '../screens/manager/ManagerLeaveRequest';
import ManagerAttendanceHistory from '../screens/manager/ManagerAttendanceHistory';

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
          <Stack.Screen name="ManagerLeaveRequest" component={ManagerLeaveRequest} />
          <Stack.Screen name="ManagerAttendanceHistory" component={ManagerAttendanceHistory} />
        </>
      ) : (
        <>
          <Stack.Screen name="HRDashboard" component={HRDashboard} />
          <Stack.Screen name="AddUser" component={AddUser} />
          <Stack.Screen name="AllAttendance" component={AllAttendance} />
          <Stack.Screen name="HRLeaveApproval" component={HRLeaveApproval} />
        </>
      )}
    </Stack.Navigator>
  );
}
