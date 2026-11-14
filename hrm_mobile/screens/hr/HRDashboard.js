import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAttendanceLogs } from '../../services/storage';
import { toCsv } from '../../services/csv';
import { formatTime } from '../../services/date';

const ATTENDANCE_COLUMNS = [
  { label: 'Username', value: log => log.username },
  { label: 'Role', value: log => log.role },
  { label: 'Date', value: log => log.date },
  { label: 'Time', value: log => formatTime(log.markedAt) },
];

export default function HRDashboard({ navigation }) {
  const { username, logout } = useContext(AuthContext);

  const resetAllData = () => {
    Alert.alert(
      'Reset all data?',
      'This permanently deletes every user, attendance record and leave request on this device. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('✅ All data has been cleared!');
            await logout();
          },
        },
      ]
    );
  };

  const exportToCSV = async () => {
    const logs = await getAttendanceLogs();

    if (logs.length === 0) {
      Alert.alert('⚠️ No attendance data found.');
      return;
    }

    const csv = toCsv(logs, ATTENDANCE_COLUMNS);

    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance.csv';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    try {
      const fileUri = FileSystem.documentDirectory + 'attendance.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export failed', 'Could not write the attendance file.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>HR Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {username} 👋</Text>

      <Button title="Add New User" onPress={() => navigation.navigate('AddUser')} />
      <View style={styles.spacer} />
      <Button title="View All Users" onPress={() => navigation.navigate('UserList')} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  spacer: { height: 15 },
});
