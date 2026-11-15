import apiClient from './client';

export interface TodayAttendance {
  id?: string;
  date: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE';
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
  method?: 'WIFI' | 'WEB' | 'MANUAL';
  wifi_ap?: string;
}

export interface AttendanceRecordItem {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | string | null;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE';
  method?: string;
  wifi_ap?: string;
  late_minutes?: number;
}

export interface AttendanceAdjustmentPayload {
  date: string;
  requested_check_in: string;
  requested_check_out: string;
  reason: string;
}

export const getTodayAttendanceApi = async (): Promise<TodayAttendance> => {
  const response = await apiClient.get('/attendance/today/');
  return response.data;
};

export const checkInApi = async (notes?: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/attendance/check-in/', { notes });
  return response.data;
};

export const checkOutApi = async (notes?: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/attendance/check-out/', { notes });
  return response.data;
};

export const getAttendanceHistoryApi = async (params: { month?: string; limit?: number } = {}): Promise<AttendanceRecordItem[]> => {
  const response = await apiClient.get('/attendance/history/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const requestAdjustmentApi = async (payload: AttendanceAdjustmentPayload): Promise<any> => {
  const response = await apiClient.post('/attendance/adjustments/', payload);
  return response.data;
};
