import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { users } from '../../services/users';

export default function LoginScreen() {
  const { setRole, setUsername } = useContext(AuthContext);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const handleLogin = () => {
    const user = users.find(
      u => u.username === inputUsername && u.password === inputPassword
    );

    if (!user) {
      Alert.alert('Login Failed', 'Invalid username or password');
      return;
    }

    setRole(user.role);
    setUsername(user.username);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Login</Text>

      <TextInput
        placeholder="Username"
        value={inputUsername}
        onChangeText={setInputUsername}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={inputPassword}
        onChangeText={setInputPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
});
