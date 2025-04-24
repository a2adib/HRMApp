import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Platform, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { saveLeaveRequest } from '../../services/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LeaveRequest() {
  const { username, role } = useContext(AuthContext);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const submitRequest = async () => {
    if (!reason) return Alert.alert('Enter a reason');

    const request = {
      id: Date.now().toString(),
      username,
      role,
      fromDate: Platform.OS === 'web' ? fromDate : fromDate.toLocaleDateString(),
      toDate: Platform.OS === 'web' ? toDate : toDate.toLocaleDateString(),
      reason,
      status: 'Pending'
    };

    await saveLeaveRequest(request);
    Alert.alert('Leave Request Submitted');
    setReason('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Request</Text>

      {Platform.OS === 'web' ? (
        <>
          <Text>From Date:</Text>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={styles.webInput}
          />
          <Text>To Date:</Text>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={styles.webInput}
          />
        </>
      ) : (
        <>
          <Button title="Select From Date" onPress={() => setShowFrom(true)} />
          {showFrom && (
            <DateTimePicker value={fromDate} mode="date" onChange={(e, d) => {
              setShowFrom(false);
              if (d) setFromDate(d);
            }} />
          )}
          <Button title="Select To Date" onPress={() => setShowTo(true)} />
          {showTo && (
            <DateTimePicker value={toDate} mode="date" onChange={(e, d) => {
              setShowTo(false);
              if (d) setToDate(d);
            }} />
          )}
        </>
      )}

      <TextInput
        placeholder="Reason"
        value={reason}
        onChangeText={setReason}
        style={styles.input}
      />

      <Button title="Submit Leave Request" onPress={submitRequest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  webInput: {
    padding: 8,
    border: '1px solid #ccc',
    borderRadius: 4,
    marginBottom: 10,
    width: '100%'
  }
});
