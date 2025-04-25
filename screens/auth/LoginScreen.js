// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { TextInput, Button, View, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const { data } = await axios.post('https://your-server.com/api/auth/login', { username, password });
      await AsyncStorage.setItem('token', data.token);
      // Navigate to the dashboard
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <View>
      <TextInput 
        placeholder="Username"
        value={username}
        onChangeText={setUsername} 
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <Button title="Login" onPress={login} />
    </View>
  );
};

export default LoginScreen;
