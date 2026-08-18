import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
    if (!username.trim() || !password) {
      Alert.alert('All fields are required');
      return;
    }

    const result = await addUser({
      username: username.trim(),
      password,
      role,
      manager: role === 'employee' ? selectedManager : null,
    });

    if (!result.ok) {
      Alert.alert('Could not add user', result.error);
      return;
    }

    Alert.alert('✅ User added');
    setUsername('');
    setPassword('');

    // A newly added manager must appear in the assignment list right away.
    if (role === 'manager') {
      const allUsers = await getUsers();
      setManagers(allUsers.filter(u => u.role === 'manager'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New User</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>Select Role</Text>
      <View style={styles.input}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Employee" value="employee" />
          <Picker.Item label="Manager" value="manager" />
        </Picker>
      </View>

      {role === 'employee' && managers.length > 0 && (
        <>
          <Text style={styles.label}>Assign to Manager</Text>
          <View style={styles.input}>
            <Picker
              selectedValue={selectedManager}
              onValueChange={(itemValue) => setSelectedManager(itemValue)}
            >
              {managers.map((mgr) => (
                <Picker.Item
                  label={mgr.username}
                  value={mgr.username}
                  key={mgr.username}
                />
              ))}
            </Picker>
          </View>
        </>
      )}

      <Button title="Add User" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10 },
  label: { marginTop: 10, marginBottom: 5 },
});
