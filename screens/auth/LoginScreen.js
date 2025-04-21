import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const { setRole } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome to Office Attendance App</Text>
      <Text style={styles.subtitle}>Please choose your role:</Text>

      <View style={styles.buttonGroup}>
        <Button title="Login as Employee" onPress={() => setRole('employee')} />
        <View style={styles.gap} />
        <Button title="Login as Manager" onPress={() => setRole('manager')} />
        <View style={styles.gap} />
        <Button title="Login as HR" onPress={() => setRole('hr')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  buttonGroup: { width: '100%' },
  gap: { height: 15 }
});
