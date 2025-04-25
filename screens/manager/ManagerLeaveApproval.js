import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getLeaveRequests, updateLeaveStatus } from '../../services/storage';

export default function ManagerLeaveApproval() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getLeaveRequests();
      const employeeRequests = data.filter(r => r.status === 'Pending' && r.role === 'employee');
      setRequests(employeeRequests);
    };
    load();
  }, []);

  const handleAction = async (id, status) => {
    await updateLeaveStatus(id, status);
    Alert.alert(`Leave ${status}`);
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Employee Leave Approvals</Text>
      {requests.length === 0 ? (
        <Text>No pending leave requests from employees.</Text>
      ) : (
        requests.map((req, idx) => (
          <View key={idx} style={styles.card}>
            <Text>👤 {req.username}</Text>
            <Text>📅 {req.fromDate} to {req.toDate}</Text>
            <Text>📄 Reason: {req.reason}</Text>
            <View style={styles.buttons}>
              <Button title="Approve" onPress={() => handleAction(req.id, 'Approved')} />
              <Button title="Reject" onPress={() => handleAction(req.id, 'Rejected')} color="red" />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, marginBottom: 20 },
  card: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
