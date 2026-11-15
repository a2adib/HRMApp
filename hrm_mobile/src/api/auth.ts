import apiClient from './client';

export interface UserProfile {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  is_active: boolean;
  employee?: {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    department_name?: string;
    designation_title?: string;
    network_username?: string;
    mac_address?: string;
    office_name?: string;
    date_of_joining?: string;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login/', { email, password });
  return response.data;
};

export const logoutApi = async (refreshToken: string): Promise<void> => {
  await apiClient.post('/auth/logout/', { refresh: refreshToken });
};

export const getMeApi = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/auth/me/');
  return response.data;
};

export const changePasswordApi = async (data: { current_password: string; new_password: string }): Promise<void> => {
  await apiClient.post('/auth/change-password/', data);
};
