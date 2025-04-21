import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import { getAllLeaveRequests, saveLeaveRequest } from '../../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'leave_requests';

export default function ApprovalScreen() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const data = await getAllLeaveRequests();
    setRequests(data);
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
      <Text style={styles.title}>📝 Pending Leave Requests</Text>
      {requests.length === 0 && <Text>No requests found.</Text>}
      {requests.map((req) => (
        <View key={req.id} style={styles.card}>
          <Text>📅 {req.fromDate} → {req.toDate}</Text>
          <Text>✍️ Reason: {req.reason}</Text>
          <Text>Status: {req.status}</Text>

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
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
