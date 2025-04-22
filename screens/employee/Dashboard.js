import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { markAttendanceToday } from '../../services/storage';

export default function Dashboard({ navigation }) {
  const markAttendance = async () => {
    const success = await markAttendanceToday();
    if (success) {
      Alert.alert("✅ Marked", "Your attendance has been recorded.");
    } else {
      Alert.alert("⚠️ Already marked", "You’ve already marked attendance today.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome, Employee</Text>

      <View style={styles.buttonGroup}>
        <Button title="✅ Mark Attendance" onPress={markAttendance} />
        <View style={styles.gap} />
        <Button title="📅 View Attendance History" onPress={() => navigation.navigate('AttendanceHistory')} />
        <View style={styles.gap} />
        <Button title="📝 Request Leave" onPress={() => navigation.navigate('LeaveRequest')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  buttonGroup: { width: '100%', gap: 20 },
  gap: { height: 20 },
});