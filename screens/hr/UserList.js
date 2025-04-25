import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getUsers } from '../../services/users';
import { getAttendanceLogs } from '../../services/storage';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const u = await getUsers();
      const a = await getAttendanceLogs();
      setUsers(u);
      setLogs(a);
    };
    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👥 All Users & Attendance</Text>
      {users.map((user, idx) => {
        const userLogs = logs.filter(l => l.username === user.username);
        return (
          <View key={idx} style={styles.card}>
            <Text>🧑 Username: {user.username}</Text>
            <Text>🔰 Role: {user.role}</Text>
            <Text>📆 Total Days Present: {userLogs.length}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, marginBottom: 20, fontWeight: 'bold' },
  card: { padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
});
