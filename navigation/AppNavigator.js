import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import Dashboard from '../screens/employee/Dashboard';
import LeaveRequest from '../screens/employee/LeaveRequest';
import ApprovalScreen from '../screens/manager/ApprovalScreen';
import HRDashboard from '../screens/hr/HRDashboard';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { role } = useContext(AuthContext); // 'employee', 'manager', or 'hr'

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!role ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : role === 'employee' ? (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="LeaveRequest" component={LeaveRequest} />
          </>
        ) : role === 'manager' ? (
          <Stack.Screen name="ApprovalScreen" component={ApprovalScreen} />
        ) : (
          <Stack.Screen name="HRDashboard" component={HRDashboard} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
