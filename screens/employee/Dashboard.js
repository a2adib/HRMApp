import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function Dashboard({ navigation }) {
  const markAttendance = () => {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();

    Alert.alert("🎉 Attendance Marked", `Date: ${date}\nTime: ${time}`);
    // Later: Save this to local storage or Firebase
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Hello, Employee!</Text>

      <View style={styles.buttonGroup}>
        <Button title="✅ Mark Attendance" onPress={markAttendance} />
        <View style={styles.spacer} />
        <Button title="📝 Request Leave" onPress={() => navigation.navigate('LeaveRequest')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  buttonGroup: { width: '100%' },
  spacer: { height: 20 }
});
