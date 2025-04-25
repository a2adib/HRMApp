import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, Alert, StyleSheet } from 'react-native';
import { getLeaveRequests, updateLeaveStatus } from '../../services/storage';

export default function HRLeaveApproval() {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const data = await getLeaveRequests();
    setRequests(data.filter(r => r.status === 'Pending'));
  };

  const handleAction = async (id, status) => {
    await updateLeaveStatus(id, status);
    Alert.alert(`Leave ${status}`);
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Leave Approval</Text>
      {requests.map((req, idx) => (
        <View key={idx} style={styles.card}>
          <Text>👤 {req.username} ({req.role})</Text>
          <Text>📅 {req.fromDate} → {req.toDate}</Text>
          <Text>📄 Reason: {req.reason}</Text>
          <View style={styles.row}>
            <Button title="Approve" onPress={() => handleAction(req.id, 'Approved')} />
            <Button title="Reject" onPress={() => handleAction(req.id, 'Rejected')} color="red" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  card: { padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});
