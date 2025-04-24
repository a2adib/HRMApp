import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HRDashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HR Dashboard</Text>
      <Button title="Add New User" onPress={() => navigation.navigate('AddUser')} />
      <Button title="View All Attendance" onPress={() => navigation.navigate('AllAttendance')} />
      <Button title="Approve Leave Requests" onPress={() => navigation.navigate('HRLeaveApproval')} />
      <Button title="Logout" color="red" onPress={() => { setRole(null); setUsername(null); }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
});
