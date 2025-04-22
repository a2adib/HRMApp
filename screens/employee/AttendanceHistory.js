import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getAttendanceLogs } from '../../services/storage';

export default function AttendanceHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAttendanceLogs();
      setLogs(data);
    };
    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📅 Attendance History</Text>
      {logs.length === 0 && <Text>No attendance yet.</Text>}
      {logs.map((log, idx) => (
        <View key={idx} style={styles.card}>
          <Text>🗓️ {log.date}</Text>
          <Text>🕒 Time: {log.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
});
