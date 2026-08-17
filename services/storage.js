import AsyncStorage from '@react-native-async-storage/async-storage';
import { toIsoDate } from './date';

const ATTENDANCE_KEY = 'attendance_logs';
const LEAVE_KEY = 'leave_requests';

export const markAttendanceToday = async (username, role) => {
  const now = new Date();
  const date = toIsoDate(now);

  try {
    const existing = await AsyncStorage.getItem(ATTENDANCE_KEY);
    const logs = existing ? JSON.parse(existing) : [];

    const alreadyMarked = logs.some(
      log => log.date === date && log.username === username
    );
    if (alreadyMarked) return false;

    logs.push({ username, role, date, markedAt: now.toISOString() });
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
    return true;
  } catch (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
};

export const getAttendanceLogs = async () => {
  try {
    const existing = await AsyncStorage.getItem(ATTENDANCE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error loading attendance:', error);
    return [];
  }
};

export const saveLeaveRequest = async (request) => {
  try {
    const existing = await AsyncStorage.getItem(LEAVE_KEY);
    const logs = existing ? JSON.parse(existing) : [];
    logs.push(request);
    await AsyncStorage.setItem(LEAVE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving leave:', error);
  }
};

export const getLeaveRequests = async () => {
  try {
    const existing = await AsyncStorage.getItem(LEAVE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error loading leave requests:', error);
    return [];
  }
};

export const updateLeaveStatus = async (id, newStatus) => {
  try {
    const existing = await AsyncStorage.getItem(LEAVE_KEY);
    const logs = existing ? JSON.parse(existing) : [];
    const updated = logs.map(log => log.id === id ? { ...log, status: newStatus } : log);
    await AsyncStorage.setItem(LEAVE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating leave status:', error);
  }
};
