import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'users_data';

export const getUsers = async () => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  if (data) return JSON.parse(data);

  const defaultUsers = [
    { username: 'emp01', password: '1234', role: 'employee' },
    { username: 'mgr01', password: '1234', role: 'manager' },
    { username: 'hr01', password: '1234', role: 'hr' }
  ];

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const addUser = async (newUser) => {
  const users = await getUsers();
  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};
