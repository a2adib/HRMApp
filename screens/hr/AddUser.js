import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Picker } from 'react-native';
import { addUser, getUsers } from '../../services/users';

export default function AddUser() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');

  useEffect(() => {
    const loadManagers = async () => {
      const allUsers = await getUsers();
      const onlyManagers = allUsers.filter(u => u.role === 'manager');
      setManagers(onlyManagers);
      if (onlyManagers.length > 0) {
        setSelectedManager(onlyManagers[0].username);
      }
    };
    loadManagers();
  }, []);

  const handleAdd = async () => {
    if (!username || !password) {
      Alert.alert('All fields are required');
      return;
    }

    const newUser = {
      username,
      password,
      role,
      manager: role === 'employee' ? selectedManager : null,
    };

    await addUser(newUser);
    Alert.alert('✅ User added');
    setUsername('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New User</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <Text style={styles.label}>Select Role</Text>
      <Picker
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Employee" value="employee" />
        <Picker.Item label="Manager" value="manager" />
      </Picker>

      {role === 'employee' && managers.length > 0 && (
        <>
          <Text style={styles.label}>Assign to Manager</Text>
          <Picker
            selectedValue={selectedManager}
            onValueChange={(itemValue) => setSelectedManager(itemValue)}
            style={styles.input}
          >
            {managers.map((mgr) => (
              <Picker.Item
                label={mgr.username}
                value={mgr.username}
                key={mgr.username}
              />
            ))}
          </Picker>
        </>
      )}

      <Button title="Add User" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, borderRadius: 6, marginBottom: 10 },
  label: { marginTop: 10, marginBottom: 5 },
});
