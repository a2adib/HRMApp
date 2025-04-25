// Inside employee/Dashboard.js
import React, { useState } from 'react';
import { Button, View, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const [status, setStatus] = useState('present');

  const markAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        'https://your-server.com/api/attendance', // Replace with actual URL
        { date: new Date(), status },
        { headers }
      );

      Alert.alert('Success', 'Your attendance has been marked!');
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', `Error: ${error.response.data.error}`);
      } else if (error.request) {
        Alert.alert('Error', 'No response from server. Please check your internet connection.');
      } else {
        Alert.alert('Error', `Unexpected error: ${error.message}`);
      }
    }
  };

  return (
    <View>
      <Button title="Mark as Present" onPress={() => setStatus('present')} />
      <Button title="Mark as Absent" onPress={() => setStatus('absent')} />
      <Button title="Mark as Leave" onPress={() => setStatus('leave')} />
      <Button title="Submit" onPress={markAttendance} />
    </View>
  );
};

export default Dashboard;
