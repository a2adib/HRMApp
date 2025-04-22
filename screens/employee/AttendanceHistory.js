import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getAttendanceLogs } from '../../services/storage';

export default function AttendanceHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await getAttendanceLogs();
      setLogs(data);
    };

    fetchLogs();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📅 Attendance History</Text>

      {logs.length === 0 ? (
        <Text>No attendance recorded yet.</Text>
      ) : (
        logs.map((log, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.date}>🗓️ {log.date}</Text>
            <Text style={styles.time}>🕒 {log.time}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
});

console.log('📦 Saving attendance...');
