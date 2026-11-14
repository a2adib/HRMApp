import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { markAttendanceToday } from '../../services/storage';
import { AuthContext } from '../../context/AuthContext';

export default function ManagerDashboard({ navigation }) {
  const { username, role, logout } = useContext(AuthContext);

  const markAttendance = async () => {
    const success = await markAttendanceToday(username, role);
    Alert.alert(success ? '✅ Marked' : '⚠️ Already marked');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manager Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {username} 👋</Text>
      <Button title="Mark Attendance" onPress={markAttendance} />
      <Button title="Request Leave" onPress={() => navigation.navigate('LeaveRequest')} />
      <Button title="View Attendance History" onPress={() => navigation.navigate('AttendanceHistory')} />
      <Button title="Approve Employee Leave" onPress={() => navigation.navigate('ManagerLeaveApproval')} />
      <Button title="View My Assigned Employees" onPress={() => navigation.navigate('AssignedEmployees')}/>

      <View style={{ marginTop: 30 }}>
        <Button title="Logout" color="red" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  
});
