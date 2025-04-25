// Inside employee/LeaveRequest.js
import React, { useState } from 'react';
import { Button, TextInput, View, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaveRequest = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const submitLeaveRequest = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        'https://your-server.com/api/leaveRequest', // Replace with actual URL
        { startDate, endDate, reason },
        { headers }
      );

      Alert.alert('Success', 'Leave request submitted!');
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
      <TextInput placeholder="Start Date" onChangeText={setStartDate} />
      <TextInput placeholder="End Date" onChangeText={setEndDate} />
      <TextInput placeholder="Reason" onChangeText={setReason} />
      <Button title="Submit Leave Request" onPress={submitLeaveRequest} />
    </View>
  );
};

export default LeaveRequest;
