import React, { useEffect, useState, useContext, useCallback } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getLeaveRequests, updateLeaveStatus } from '../../services/storage';
import { getUsers } from '../../services/users';
import { formatDisplayDate } from '../../services/date';
import { AuthContext } from '../../context/AuthContext';

export default function ManagerLeaveApproval() {
  const [requests, setRequests] = useState([]);
  const { username } = useContext(AuthContext);

  const load = useCallback(async () => {
    const [allRequests, users] = await Promise.all([getLeaveRequests(), getUsers()]);

    // Only this manager's direct reports — without this every manager can see
    // and approve leave for every other manager's team.
    const myReports = new Set(
      users
        .filter(user => user.role === 'employee' && user.manager === username)
        .map(user => user.username)
    );

    setRequests(
      allRequests.filter(
        request => request.status === 'Pending' && myReports.has(request.username)
      )
    );
  }, [username]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, status) => {
    await updateLeaveStatus(id, status);
    Alert.alert(`Leave ${status}`);
    setRequests(current => current.filter(request => request.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Employee Leave Approvals</Text>
      {requests.length === 0 ? (
        <Text>No pending leave requests from your team.</Text>
      ) : (
        requests.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text>👤 {req.username}</Text>
            <Text>📅 {formatDisplayDate(req.fromDate)} to {formatDisplayDate(req.toDate)}</Text>
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
