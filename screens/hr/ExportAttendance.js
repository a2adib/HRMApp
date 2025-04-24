import React from 'react';
import { View, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAttendanceLogs } from '../../services/storage';

export default function ExportAttendance() {
  const exportToCSV = async () => {
    try {
      const logs = await getAttendanceLogs();

      if (logs.length === 0) {
        Alert.alert('No attendance data found');
        return;
      }

      const header = 'Username,Role,Date,Time\n';
      const rows = logs.map(log =>
        `${log.username},${log.role},${log.date},${log.time}`
      ).join('\n');

      const csv = header + rows;
      const fileUri = FileSystem.documentDirectory + 'attendance.csv';

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to export CSV.');
    }
  };
}
