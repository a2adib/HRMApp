import AsyncStorage from '@react-native-async-storage/async-storage';

const ATTENDANCE_KEY = 'attendance_logs';

export const markAttendanceToday = async () => {
  const today = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  try {
    const existing = await AsyncStorage.getItem(ATTENDANCE_KEY);
    const logs = existing ? JSON.parse(existing) : [];

    const alreadyMarked = logs.find(log => log.date === today);
    if (alreadyMarked) return false;

    logs.push({ date: today, time });
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
    console.log('✅ Attendance saved:', logs);
    return true;
  } catch (e) {
    console.error('❌ Error saving attendance:', e);
    return false;
  }
};

export const getAttendanceLogs = async () => {
  try {
    const existing = await AsyncStorage.getItem(ATTENDANCE_KEY);
    const logs = existing ? JSON.parse(existing) : [];
    console.log('📖 Attendance logs fetched:', logs);
    return logs;
  } catch (e) {
    console.error('❌ Error reading attendance logs:', e);
    return [];
  }
};
