import React, { useState, useContext } from 'react';
import { View, Text, Button, Platform, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveLeaveRequest } from '../../services/storage';
import { AuthContext } from '../../context/AuthContext';

export default function LeaveRequest() {
  const { username, role } = useContext(AuthContext);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!reason) return Alert.alert('Please enter a reason');

    await saveLeaveRequest({
      id: Date.now().toString(),
      username,
      role,
      fromDate: fromDate.toLocaleDateString(),
      toDate: toDate.toLocaleDateString(),
      reason,
      status: 'Pending'
    });

    Alert.alert('Leave Request Submitted');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Request</Text>

      <Button title={`From: ${fromDate.toLocaleDateString()}`} onPress={() => setShowFrom(true)} />
      {showFrom && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShowFrom(Platform.OS === 'ios');
            if (selected) setFromDate(selected);
          }}
        />
      )}

      <Button title={`To: ${toDate.toLocaleDateString()}`} onPress={() => setShowTo(true)} />
      {showTo && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShowTo(Platform.OS === 'ios');
            if (selected) setToDate(selected);
          }}
        />
      )}

      <Text style={styles.label}>Reason:</Text>
      <Button title="Submit Request" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  label: { marginVertical: 10 },
});
