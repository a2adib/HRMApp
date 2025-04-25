// Inside hr/HRDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HRDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  const fetchAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        'https://your-server.com/api/attendance', // Replace with actual URL
        { headers }
      );

      setAttendanceData(response.data);
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

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <View>
      <Text>Attendance Records:</Text>
      <FlatList
        data={attendanceData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.date} - {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default HRDashboard;
