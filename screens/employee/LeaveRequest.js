// screens/employee/LeaveRequest.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function LeaveRequest() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const submitLeave = () => {
    Alert.alert("Leave Requested", `From: ${fromDate}\nTo: ${toDate}\nReason: ${reason}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>From Date</Text>
      <TextInput style={styles.input} onChangeText={setFromDate} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>To Date</Text>
      <TextInput style={styles.input} onChangeText={setToDate} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>Reason</Text>
      <TextInput style={styles.input} onChangeText={setReason} placeholder="Enter reason" />

      <Button title="Submit Leave" onPress={submitLeave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
});
