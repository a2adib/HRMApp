import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getUsers } from '../../services/users';
import { AuthContext } from '../../context/AuthContext';

export default function AssignedEmployees() {
  const [employees, setEmployees] = useState([]);
  const { username } = useContext(AuthContext); // current manager username

  useEffect(() => {
    const fetchEmployees = async () => {
      const users = await getUsers();
      const filtered = users.filter(
        (user) => user.role === 'employee' && user.manager === username
      );
      setEmployees(filtered);
    };
    fetchEmployees();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assigned Employees</Text>
      {employees.length === 0 ? (
        <Text>No employees assigned to you.</Text>
      ) : (
        employees.map((emp, idx) => (
          <View key={idx} style={styles.card}>
            <Text>👤 {emp.username}</Text>
            <Text>🔗 Assigned by HR</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
});
