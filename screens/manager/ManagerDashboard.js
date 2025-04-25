// src/screens/ManagerDashboard.js
import React, { useEffect, useState } from 'react';
import { View, Button, Text, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManagerDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const fetchLeaveRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get('https://your-server.com/api/leaveRequest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests', error);
    }
  };

  const approveLeave = async (id) => {
    const token = await AsyncStorage.getItem('token');
    await axios.put(`https://your-server.com/api/leaveRequest/${id}`, { status: 'approved' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchLeaveRequests(); // refresh leave requests
  };

  const rejectLeave = async (id) => {
    const token = await AsyncStorage.getItem('token');
    await axios.put(`https://your-server.com/api/leaveRequest/${id}`, { status: 'rejected' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchLeaveRequests(); // refresh leave requests
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  return (
    <View>
      <Text>Leave Requests:</Text>
      <FlatList
        data={leaveRequests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{`Leave from ${item.startDate} to ${item.endDate} - ${item.status}`}</Text>
            {item.status === 'pending' && (
              <>
                <Button title="Approve" onPress={() => approveLeave(item._id)} />
                <Button title="Reject" onPress={() => rejectLeave(item._id)} />
              </>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ManagerDashboard;
