import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { markAttendanceToday } from '../../services/storage';
import { AuthContext } from '../../context/AuthContext';

export default function ManagerDashboard({ navigation }) {
  const { username, role } = useContext(AuthContext);

  const markAttendance = async () => {
    const success = await markAttendanceToday(username, role);
    Alert.alert(success ? '✅ Marked' : '⚠️ Already marked');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manager Dashboard</Text>
      <Button title="Mark Attendance" onPress={markAttendance} />
      <Button title="Request Leave" onPress={() => navigation.navigate('ManagerLeaveRequest')} />
      <Button title="View Attendance History" onPress={() => navigation.navigate('ManagerAttendanceHistory')} />
      <Button title="Logout" color="red" onPress={() => { setRole(null); setUsername(null); }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
});
