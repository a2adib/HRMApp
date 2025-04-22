const ATTENDANCE_KEY = 'attendance_logs';

export const markAttendanceToday = async () => {
  const today = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  const existing = await AsyncStorage.getItem(ATTENDANCE_KEY);
  const logs = existing ? JSON.parse(existing) : [];

  const alreadyMarked = logs.find(log => log.date === today);
  if (alreadyMarked) return false;

  logs.push({ date: today, time });
  await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
  return true;
};

export const getAttendanceLogs = async () => {
  const existing = await AsyncStorage.getItem(ATTENDANCE_KEY);
  return existing ? JSON.parse(existing) : [];
};
