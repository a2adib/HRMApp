import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'leave_requests';

export const saveLeaveRequest = async (newRequest) => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];
    const updated = [...parsed, { id: Date.now(), ...newRequest }];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving leave request', e);
  }
};

export const getAllLeaveRequests = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    console.error('Error reading leave requests', e);
    return [];
  }
};
