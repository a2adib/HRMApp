import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import { getAttendanceLogs } from '../../services/storage';

export default function AllAttendance() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [role, setRole] = useState('all');

  useEffect(() => {
    const load = async () => {
      const data = await getAttendanceLogs();
      setLogs(data);
      setFiltered(data);
    };
    load();
  }, []);

  const applyFilter = (roleFilter) => {
    setRole(roleFilter);
    if (roleFilter === 'all') setFiltered(logs);
    else setFiltered(logs.filter(log => log.role === roleFilter));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>All Attendance</Text>
      <View style={styles.buttonRow}>
        <Button title="All" onPress={() => applyFilter('all')} />
        <Button title="Employee" onPress={() => applyFilter('employee')} />
        <Button title="Manager" onPress={() => applyFilter('manager')} />
      </View>
      {filtered.map((log, i) => (
        <View key={i} style={styles.card}>
          <Text>👤 {log.username} ({log.role})</Text>
          <Text>📅 {log.date}</Text>
          <Text>⏰ {log.time}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  card: { padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
});
