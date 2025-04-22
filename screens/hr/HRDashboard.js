import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'leave_requests';

export default function HRDashboard() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];
    setRequests(parsed);
  };

  const updateStatus = async (id, newStatus) => {
    const updated = requests.map(req =>
      req.id === id ? { ...req, status: newStatus } : req
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    fetchRequests(); // refresh list
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👩‍💼 HR Leave Dashboard</Text>

      {requests.length === 0 && <Text>No leave requests yet.</Text>}
      {requests.map((req) => (
        <View key={req.id} style={styles.card}>
          <Text>📅 {req.fromDate} → {req.toDate}</Text>
          <Text>🧑 Reason: {req.reason}</Text>
          <Text>Status: <Text style={{ fontWeight: 'bold' }}>{req.status}</Text></Text>

          {req.status === 'Pending' && (
            <View style={styles.actions}>
              <Button title="Approve ✅" onPress={() => updateStatus(req.id, 'Approved')} />
              <Button title="Reject ❌" color="red" onPress={() => updateStatus(req.id, 'Rejected')} />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
