import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAttendanceLogs } from '../../services/storage';

export default function HRDashboard({ navigation }) {
  const { username, setRole, setUsername } = useContext(AuthContext);

  const logout = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('role');
    setRole(null);
    setUsername(null);
  };

  const resetAllData = async () => {
    await AsyncStorage.clear();
    Alert.alert('✅ All data has been cleared!');
    logout();
  };

  const exportToCSV = async () => {
    const logs = await getAttendanceLogs();

    if (logs.length === 0) {
      Alert.alert('⚠️ No attendance data found.');
      return;
    }

    const header = 'Username,Role,Date,Time\n';
    const rows = logs.map(log =>
      `${log.username},${log.role},${log.date},${log.time}`
    ).join('\n');
    const csv = header + rows;

    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const fileUri = FileSystem.documentDirectory + 'attendance.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv);
      await Sharing.shareAsync(fileUri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HR Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {username} 👋</Text>

      <Button title="Add New User" onPress={() => navigation.navigate('AddUser')} />
      <View style={styles.spacer} />
      <Button title="View All Attendance" onPress={() => navigation.navigate('AllAttendance')} />
      <View style={styles.spacer} />
      <Button title="Approve Leave Requests" onPress={() => navigation.navigate('HRLeaveApproval')} />
      <View style={styles.spacer} />
      <Button title="📤 Export Attendance to CSV" onPress={exportToCSV} />
      <View style={styles.spacer} />
      <Button title="🗑️ Reset All Data" color="red" onPress={resetAllData} />
      <View style={styles.spacer} />
      <Button title="Logout" color="gray" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  spacer: { height: 15 },
});
