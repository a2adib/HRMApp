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

export interface GeofenceInfo {
  verified: boolean;
  distance_meters: number | null;
  allowed_radius_meters: number | null;
  office_name: string | null;
  office_id: string | null;
  reason?: string;
}

export interface PunchPayload {
  notes?: string;
  latitude?: number;
  longitude?: number;
  enforce_geofence?: boolean;
  device_info?: string;
}

export interface PunchResponse {
  detail: string;
  record?: any;
  geofence?: GeofenceInfo | null;
}

export const getTodayAttendanceApi = async (): Promise<TodayAttendance> => {
  const response = await apiClient.get('/attendance/today/');
  return response.data;
};

export const checkInApi = async (payload?: PunchPayload | string): Promise<PunchResponse> => {
  const body = typeof payload === 'string' ? { notes: payload } : (payload || {});
  const response = await apiClient.post('/attendance/check-in/', body);
  return response.data;
};

export const checkOutApi = async (payload?: PunchPayload | string): Promise<PunchResponse> => {
  const body = typeof payload === 'string' ? { notes: payload } : (payload || {});
  const response = await apiClient.post('/attendance/check-out/', body);
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
