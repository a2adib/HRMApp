import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTENDANCE_KEY = 'attendance_logs';
const LEAVE_KEY = 'leave_requests';

export const markAttendanceToday = async (username, role) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString();
  const formattedTime = today.toLocaleTimeString();

  try {
    const existing = await AsyncStorage.getItem(ATTENDANCE_KEY);
    const logs = existing ? JSON.parse(existing) : [];

    const alreadyMarked = logs.find(
      log => log.date === formattedDate && log.username === username
    );
    if (alreadyMarked) return false;

    logs.push({ username, role, date: formattedDate, time: formattedTime });
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
