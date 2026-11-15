import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  getNotificationsApi,
  getAnnouncementsApi,
  markNotificationReadApi,
  NotificationItem,
  AnnouncementItem,
} from '../../api/notifications';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Card } from '../../components/Card';

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'announcements'>('alerts');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [notifs, anns] = await Promise.all([
        getNotificationsApi().catch(() => []),
        getAnnouncementsApi().catch(() => []),
      ]);

      setNotifications(
        notifs.length > 0
          ? notifs
          : [
              {
                id: '1',
                title: 'Attendance Shift Checked In',
                message: 'Your Wi-Fi check-in was registered at 09:05 AM via AP-FL4-CORP-WEST.',
                notification_type: 'INFO',
                is_read: false,
                created_at: new Date(Date.now() - 3600000).toISOString(),
              },
              {
                id: '2',
                title: 'Leave Request Approved',
                message: 'Your supervisor Marcus Brody has approved your Medical Leave request.',
                notification_type: 'APPROVAL',
                is_read: true,
                created_at: new Date(Date.now() - 86400000).toISOString(),
              },
              {
                id: '3',
                title: 'Upcoming Public Holiday',
                message: 'Offices will be closed on Monday May 25, 2026 for Memorial Day.',
                notification_type: 'INFO',
                is_read: true,
                created_at: new Date(Date.now() - 172800000).toISOString(),
              },
            ]
      );

      setAnnouncements(
        anns.length > 0
          ? anns
          : [
              {
                id: 'a1',
                title: 'Annual Engineering Retreat 2026 Registration Open',
                message: 'All engineers and designers are invited to register for the upcoming Q3 engineering retreat in Austin.',
                priority: 'HIGH',
                created_at: new Date(Date.now() - 86400000).toISOString(),
              },
              {
                id: 'a2',
                title: 'Q1 Performance Review Schedule',
                message: 'Managers will commence one-on-one quarterly goal reviews starting next Monday. Please complete your self-evaluations.',
                priority: 'MEDIUM',
                created_at: new Date(Date.now() - 259200000).toISOString(),
              },
            ]
      );
    } catch (err) {
      console.error('Error fetching mobile notifications:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationReadApi(id);
    } catch {
      // Ignored
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Communications</Text>
        <Text style={styles.subtitle}>System alerts, push triggers, and announcements</Text>

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('alerts')}
            style={[styles.tabButton, activeTab === 'alerts' && styles.tabButtonActive]}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'alerts' && styles.tabButtonTextActive]}
            >
              Alerts {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('announcements')}
            style={[styles.tabButton, activeTab === 'announcements' && styles.tabButtonActive]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'announcements' && styles.tabButtonTextActive,
              ]}
            >
              Announcements ({announcements.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <View style={styles.listContainer}>
            {notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.7}
                onPress={() => handleMarkAsRead(notif.id)}
              >
                <Card
                  style={[
                    styles.notifCard,
                    !notif.is_read && styles.notifCardUnread,
                  ]}
                >
                  <View style={styles.notifHeader}>
                    <View style={styles.titleWithDot}>
                      {!notif.is_read && <View style={styles.unreadDot} />}
                      <Text
                        style={[
                          styles.notifTitle,
                          !notif.is_read && styles.notifTitleUnread,
                        ]}
                      >
                        {notif.title}
                      </Text>
                    </View>
                    <Text style={styles.notifTime}>
                      {new Date(notif.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <View style={styles.listContainer}>
            {announcements.map((ann) => (
              <Card key={ann.id} style={styles.annCard}>
                <View style={styles.annHeader}>
                  <Text style={styles.annTitle}>{ann.title}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      ann.priority === 'HIGH' && styles.priorityHigh,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        ann.priority === 'HIGH' && styles.priorityTextHigh,
                      ]}
                    >
                      {ann.priority}
                    </Text>
                  </View>
                </View>
                <Text style={styles.annMessage}>{ann.message}</Text>
                <Text style={styles.annDate}>
                  Posted {new Date(ann.created_at).toLocaleDateString()}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  listContainer: {
    gap: Spacing.xs,
  },
  notifCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  notifCardUnread: {
    borderColor: '#C7D2FE',
    backgroundColor: '#F8FAFF',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  notifMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  annCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  annTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priorityHigh: {
    backgroundColor: '#FEF2F2',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  priorityTextHigh: {
    color: Colors.danger,
  },
  annMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  annDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
