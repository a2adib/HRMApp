import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { addUser } from '../../services/users';

export default function AddUser() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('All fields are required');
      return;
    }

    await addUser({ username, password, role });
    Alert.alert('✅ User added');
    setUsername('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New User</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Set Role: Employee" onPress={() => setRole('employee')} />
      <Button title="Set Role: Manager" onPress={() => setRole('manager')} />
      <View style={{ marginTop: 10 }} />
      <Button title="Add User" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, borderRadius: 6, marginBottom: 10 },
});
