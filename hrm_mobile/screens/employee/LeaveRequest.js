import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Platform, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { saveLeaveRequest } from '../../services/storage';
import { toIsoDate, formatDisplayDate } from '../../services/date';
import DateTimePicker from '@react-native-community/datetimepicker';

/** `<input type="date">` emits and expects `YYYY-MM-DD`, parsed here as local time. */
const parseIsoDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function LeaveRequest() {
  const { username, role } = useContext(AuthContext);

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const submitRequest = async () => {
    if (!reason.trim()) return Alert.alert('Enter a reason');

    const from = toIsoDate(fromDate);
    const to = toIsoDate(toDate);
    if (to < from) {
      return Alert.alert('Invalid dates', 'The end date cannot be before the start date.');
    }

    // Dates are stored as ISO `YYYY-MM-DD` so they sort correctly and read the
    // same for an approver whose device uses a different locale.
    await saveLeaveRequest({
      id: Date.now().toString(),
      username,
      role,
      fromDate: from,
      toDate: to,
      reason: reason.trim(),
      status: 'Pending',
    });

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
            value={toIsoDate(fromDate)}
            onChange={(e) => e.target.value && setFromDate(parseIsoDate(e.target.value))}
            style={webInputStyle}
          />
          <Text>To Date:</Text>
          <input
            type="date"
            value={toIsoDate(toDate)}
            onChange={(e) => e.target.value && setToDate(parseIsoDate(e.target.value))}
            style={webInputStyle}
          />
        </>
      ) : (
        <>
          <Button title={`From: ${formatDisplayDate(toIsoDate(fromDate))}`} onPress={() => setShowFrom(true)} />
          {showFrom && (
            <DateTimePicker value={fromDate} mode="date" onChange={(e, d) => {
              setShowFrom(false);
              if (d) setFromDate(d);
            }} />
          )}
          <View style={styles.spacer} />
          <Button title={`To: ${formatDisplayDate(toIsoDate(toDate))}`} onPress={() => setShowTo(true)} />
          {showTo && (
            <DateTimePicker value={toDate} mode="date" minimumDate={fromDate} onChange={(e, d) => {
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

// A plain DOM element needs a plain style object, not a StyleSheet entry.
const webInputStyle = {
  padding: 8,
  border: '1px solid #ccc',
  borderRadius: 4,
  marginBottom: 10,
  width: '100%',
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginVertical: 15 },
  spacer: { height: 10 },
});
