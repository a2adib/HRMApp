import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'users_data';

export const getUsers = async () => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  if (data) return JSON.parse(data);

  const defaultUsers = [
    {
      username: 'emp02',
      password: '1234',
      role: 'employee',
      manager: 'mgr01'  // ✅ Assigned manager's username
    },
    { username: 'mgr01', password: '1234', role: 'manager' },
    { username: 'hr01', password: '1234', role: 'hr' }
  ];

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

/** Look up a user by username, ignoring case and surrounding whitespace. */
export const findUser = async (username) => {
  const users = await getUsers();
  const needle = String(username || '').trim().toLowerCase();
  return users.find(user => user.username.toLowerCase() === needle) || null;
};

/**
 * Add a user, rejecting a username that is already taken.
 *
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export const addUser = async (newUser) => {
  const username = String(newUser.username || '').trim();
  if (!username) return { ok: false, error: 'Username is required' };

  const users = await getUsers();
  const taken = users.some(
    user => user.username.toLowerCase() === username.toLowerCase()
  );
  if (taken) return { ok: false, error: `Username "${username}" is already taken` };

  users.push({ ...newUser, username });
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true };
};
