import apiClient from './client';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: 'INFO' | 'WARNING' | 'ALERT' | 'APPROVAL';
  is_read: boolean;
  created_at: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  description?: string;
}

export const getNotificationsApi = async (): Promise<NotificationItem[]> => {
  const response = await apiClient.get('/notifications/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const markNotificationReadApi = async (id: string): Promise<void> => {
  await apiClient.post(`/notifications/${id}/read/`);
};

export const getAnnouncementsApi = async (): Promise<AnnouncementItem[]> => {
  const response = await apiClient.get('/notifications/announcements/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getHolidaysApi = async (params: { upcoming?: boolean } = {}): Promise<HolidayItem[]> => {
  const response = await apiClient.get('/holidays/', { params });
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};
