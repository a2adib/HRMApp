import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveLeaveRequest } from '../../services/storage';

export default function LeaveRequest() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !reason) {
      Alert.alert('Please fill all fields');
      return;
    }

    const newRequest = {
      fromDate: fromDate.toDateString(),
      toDate: toDate.toDateString(),
      reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    await saveLeaveRequest(newRequest);
    Alert.alert('Leave submitted!');
    setFromDate(null);
    setToDate(null);
    setReason('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>From Date</Text>
      <Button
        title={fromDate ? fromDate.toDateString() : 'Select From Date'}
        onPress={() => setShowFromPicker(true)}
      />
      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>To Date</Text>
      <Button
        title={toDate ? toDate.toDateString() : 'Select To Date'}
        onPress={() => setShowToPicker(true)}
      />
      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Reason</Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Type your reason..."
        style={styles.input}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Submit Leave Request" onPress={handleSubmit} />
      </View>
    </View>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginVertical: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
