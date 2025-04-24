import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getUsers } from '../../services/users';

export default function LoginScreen() {
  const { setRole, setUsername, updateLogin } = useContext(AuthContext);

  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const handleLogin = async () => {
    const users = await getUsers();
    const user = users.find(
      u => u.username === inputUsername && u.password === inputPassword
    );

    if (!user) {
      Alert.alert('Login Failed', 'Invalid username or password');
      return;
    }

    updateLogin(user.username, user.role);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Username" value={inputUsername} onChangeText={setInputUsername} style={styles.input} />
      <TextInput placeholder="Password" value={inputPassword} onChangeText={setInputPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 6 },
});
