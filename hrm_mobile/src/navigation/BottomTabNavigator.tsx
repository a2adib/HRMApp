import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import LeaveScreen from '../screens/leave/LeaveScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Clean vector-like icons for tab bar
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  let iconText = '🏠';
  if (label === 'Attendance') iconText = '⏱️';
  if (label === 'Leave') iconText = '📅';
  if (label === 'Alerts') iconText = '🔔';
  if (label === 'Profile') iconText = '👤';

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, { opacity: focused ? 1 : 0.6 }]}>{iconText}</Text>
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ focused }) => <TabIcon label="Attendance" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Leave"
        component={LeaveScreen}
        options={{
          tabBarLabel: 'Time Off',
          tabBarIcon: ({ focused }) => <TabIcon label="Leave" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon label="Alerts" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
});
