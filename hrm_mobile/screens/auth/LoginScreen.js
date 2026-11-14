import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { findUser } from '../../services/users';

export default function LoginScreen() {
  const { updateLogin } = useContext(AuthContext);

  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const user = await findUser(inputUsername);

      if (!user || user.password !== inputPassword) {
        Alert.alert('Login Failed', 'Invalid username or password');
        return;
      }

      await updateLogin(user.username, user.role);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={inputUsername}
        onChangeText={setInputUsername}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={inputPassword}
        onChangeText={setInputPassword}
        secureTextEntry
        autoCapitalize="none"
        onSubmitEditing={handleLogin}
        style={styles.input}
      />
      <Button title={isSubmitting ? 'Signing in…' : 'Login'} onPress={handleLogin} disabled={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 6 },
});
