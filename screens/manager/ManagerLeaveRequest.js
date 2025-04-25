// Inside manager/ManagerLeaveReq.js
import React, { useState } from 'react';
import { Button, View, Text, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManagerLeaveReq = ({ leaveRequestId }) => {
  const [status, setStatus] = useState('approved');

  const handleLeaveRequest = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.put(
        `https://your-server.com/api/leaveRequest/${leaveRequestId}`, // Replace with actual URL
        { status },
        { headers }
      );

      Alert.alert('Success', 'Leave request updated!');
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
      <Text>Leave Request: {leaveRequestId}</Text>
      <Button title="Approve" onPress={() => setStatus('approved')} />
      <Button title="Reject" onPress={() => setStatus('rejected')} />
      <Button title="Submit" onPress={handleLeaveRequest} />
    </View>
  );
};

export default ManagerLeaveReq;
