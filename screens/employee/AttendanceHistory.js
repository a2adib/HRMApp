import React, { useEffect, useState, useContext } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { getAttendanceLogs } from '../../services/storage';
import { AuthContext } from '../../context/AuthContext';

export default function AttendanceHistory() {
  const [logs, setLogs] = useState([]);
  const { username } = useContext(AuthContext);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await getAttendanceLogs();
      const filtered = data.filter(log => log.username === username);
      setLogs(filtered);
    };
    fetchLogs();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📅 Your Attendance</Text>
      {logs.length === 0 ? (
        <Text>No attendance marked yet.</Text>
      ) : (
        logs.map((log, index) => (
          <View key={index} style={styles.card}>
            <Text>📆 {log.date}</Text>
            <Text>⏰ {log.time}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  card: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: '#f9f9f9' },
});
