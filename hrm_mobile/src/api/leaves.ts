import apiClient from './client';

export interface LeaveBalance {
  id: string;
  leave_type_name: string;
  total_allocated: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface LeaveType {
  id: string;
  name: string;
  days_per_year: number;
  is_paid: boolean;
}

export interface LeaveRequestItem {
  id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  created_at: string;
}

export interface ApplyLeavePayload {
  leave_type: string;
  start_date: string;
  end_date: string;
  is_half_day: boolean;
  reason: string;
}

export const getLeaveBalancesApi = async (): Promise<LeaveBalance[]> => {
  const response = await apiClient.get('/leaves/balances/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getLeaveTypesApi = async (): Promise<LeaveType[]> => {
  const response = await apiClient.get('/leaves/types/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getLeaveRequestsApi = async (): Promise<LeaveRequestItem[]> => {
  const response = await apiClient.get('/leaves/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const applyLeaveApi = async (payload: ApplyLeavePayload): Promise<LeaveRequestItem> => {
  const response = await apiClient.post('/leaves/', payload);
  return response.data;
};
