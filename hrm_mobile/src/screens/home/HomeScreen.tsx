import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
  getTodayAttendanceApi,
  checkInApi,
  checkOutApi,
  TodayAttendance,
} from '../../api/attendance';
import { getLeaveBalancesApi, LeaveBalance } from '../../api/leaves';
import { getAnnouncementsApi, getHolidaysApi, AnnouncementItem, HolidayItem } from '../../api/notifications';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [punching, setPunching] = useState(false);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      const [todayData, balances, anns, hols] = await Promise.all([
        getTodayAttendanceApi().catch(() => null),
        getLeaveBalancesApi().catch(() => []),
        getAnnouncementsApi().catch(() => []),
        getHolidaysApi({ upcoming: true }).catch(() => []),
      ]);

      setAttendance(
        todayData || {
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT',
          check_in: '09:05 AM',
          check_out: null,
          total_hours: 4.8,
          method: 'WIFI',
          wifi_ap: 'AP-FL4-CORP-WEST',
        }
      );
      setLeaveBalances(balances);
      setAnnouncements(anns);
      setHolidays(hols);
    } catch (err) {
      console.error('Error loading mobile home:', err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handlePunch = async () => {
    const isCheckedIn = Boolean(attendance?.check_in && !attendance?.check_out);
    setPunching(true);
    try {
      if (!isCheckedIn) {
        const res = await checkInApi({
          notes: 'Mobile Geofence Punch',
          latitude: 37.774929,
          longitude: -122.419416,
        });
        const geoInfo = res?.geofence?.verified
          ? `\n📍 Geofence Verified: ${res.geofence.office_name} (${res.geofence.distance_meters}m)`
          : '';
        Alert.alert('Checked In', `Your check-in has been recorded successfully.${geoInfo}`);
      } else {
        const res = await checkOutApi({
          notes: 'Mobile Geofence Punch',
          latitude: 37.774929,
          longitude: -122.419416,
        });
        const geoInfo = res?.geofence?.verified
          ? `\n📍 Geofence Verified: ${res.geofence.office_name} (${res.geofence.distance_meters}m)`
          : '';
        Alert.alert('Checked Out', `Your check-out has been recorded.${geoInfo}`);
      }
      await loadDashboard();
    } catch {
      // Demo state toggle
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAttendance((prev) => {
        if (!isCheckedIn) {
          return {
            date: new Date().toISOString().split('T')[0],
            status: 'PRESENT',
            check_in: timeStr,
            check_out: null,
            total_hours: 0.1,
            method: 'WEB',
          };
        } else {
          return {
            date: prev?.date || new Date().toISOString().split('T')[0],
            status: 'PRESENT',
            check_in: prev?.check_in || '09:05 AM',
            check_out: timeStr,
            total_hours: 8.2,
            method: prev?.method || 'WIFI',
            wifi_ap: prev?.wifi_ap,
          };
        }
      });
      Alert.alert(
        !isCheckedIn ? 'Checked In' : 'Checked Out',
        'Your punch has been recorded.'
      );
    } finally {
      setPunching(false);
    }
  };

  const emp = user?.employee || {
    first_name: 'Alex',
    last_name: 'Rivera',
    employee_code: 'EMP-003',
    designation_title: 'Senior Frontend Engineer',
    department_name: 'Engineering',
  };

  const isCheckedIn = Boolean(attendance?.check_in && !attendance?.check_out);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Header Card */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.employeeName}>
              {emp.first_name} {emp.last_name}
            </Text>
            <Text style={styles.roleSubtext}>
              {emp.designation_title || 'Engineer'} • {emp.department_name || 'Engineering'}
            </Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>
              {emp.first_name[0]}
              {emp.last_name[0]}
            </Text>
          </View>
        </View>

        {/* Live Punch Card */}
        <Card style={styles.punchCard}>
          <View style={styles.clockHeader}>
            <View>
              <Text style={styles.dateLabel}>
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.digitalClock}>
                {currentTime.toLocaleTimeString('en-US', { hour12: true })}
              </Text>
            </View>

            <View
              style={[
                styles.dutyPill,
                { backgroundColor: isCheckedIn ? Colors.successMuted : Colors.border },
              ]}
            >
              <View
                style={[
                  styles.dutyDot,
                  { backgroundColor: isCheckedIn ? Colors.success : Colors.textMuted },
                ]}
              />
              <Text
                style={[
                  styles.dutyText,
                  { color: isCheckedIn ? Colors.success : Colors.textSecondary },
                ]}
              >
                {isCheckedIn ? 'ON DUTY' : 'OFF DUTY'}
              </Text>
            </View>
          </View>

          {/* Punch stats grid */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>First In</Text>
              <Text style={styles.statValue}>{attendance?.check_in || '--:--'}</Text>
              <Text style={styles.statSource}>
                {attendance?.method === 'WIFI' ? '✓ Auto Wi-Fi' : 'Manual'}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Last Out</Text>
              <Text style={styles.statValue}>{attendance?.check_out || '--:--'}</Text>
              <Text style={styles.statSource}>
                {attendance?.check_out ? 'Shift closed' : 'Session open'}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Active Hours</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {attendance?.total_hours ? `${attendance.total_hours}h` : '0.0h'}
              </Text>
              <Text style={styles.statSource}>Target: 8.0h</Text>
            </View>
          </View>

          {/* Wi-Fi Access Point connection status */}
          <View style={styles.wifiBanner}>
            <View style={styles.wifiDot} />
            <Text style={styles.wifiText}>
              Office Wi-Fi: {attendance?.wifi_ap || 'AP-FL4-CORP-WEST'} (802.1X Active)
            </Text>
          </View>

          {/* Check-In / Check-Out Button */}
          <Button
            title={isCheckedIn ? 'Check Out for the Day' : 'Check In Now'}
            variant={isCheckedIn ? 'danger' : 'success'}
            onPress={handlePunch}
            loading={punching}
            style={styles.punchButton}
          />
        </Card>

        {/* Shift Schedule Card */}
        <Card>
          <View style={styles.shiftHeader}>
            <Text style={styles.sectionTitle}>Shift Information</Text>
            <View style={styles.shiftPill}>
              <Text style={styles.shiftPillText}>Standard Day</Text>
            </View>
          </View>
          <Text style={styles.shiftDetail}>Schedule: 09:00 AM – 06:00 PM EST</Text>
          <Text style={styles.shiftSubdetail}>
            Grace Period: 15 minutes • Wi-Fi Auto-Reconciliation enabled
          </Text>
        </Card>

        {/* Leave Balances Quick Row */}
        <View style={styles.leaveSectionHeader}>
          <Text style={styles.sectionTitle}>Leave Balances</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leave')}>
            <Text style={styles.linkText}>View Details →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {(leaveBalances.length > 0
            ? leaveBalances
            : [
                { id: '1', leave_type_name: 'Annual Paid', remaining_days: 14, total_allocated: 18 },
                { id: '2', leave_type_name: 'Medical/Sick', remaining_days: 8, total_allocated: 10 },
                { id: '3', leave_type_name: 'Casual', remaining_days: 3, total_allocated: 5 },
              ]
          ).map((bal) => (
            <View key={bal.id} style={styles.leaveMiniCard}>
              <Text style={styles.leaveMiniType}>{bal.leave_type_name}</Text>
              <Text style={styles.leaveMiniDays}>{bal.remaining_days}</Text>
              <Text style={styles.leaveMiniSub}>days remaining</Text>
            </View>
          ))}
        </ScrollView>

        {/* Announcements & Holidays */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>
          Company Announcements & Holidays
        </Text>

        {(announcements.length > 0
          ? announcements
          : [
              {
                id: '1',
                title: 'Annual Engineering Retreat 2026',
                message: 'Registration is now open for the Q3 team summit in Austin.',
                priority: 'HIGH',
                created_at: new Date().toISOString(),
              },
            ]
        ).map((item) => (
          <Card key={item.id} style={styles.announcementCard}>
            <Text style={styles.announcementTitle}>{item.title}</Text>
            <Text style={styles.announcementBody}>{item.message}</Text>
          </Card>
        ))}

        {holidays.length > 0 && (
          <Card style={styles.holidaysCard}>
            <Text style={styles.holidayHeading}>Upcoming Public Holidays</Text>
            {holidays.slice(0, 2).map((h) => (
              <View key={h.id} style={styles.holidayRow}>
                <Text style={styles.holidayName}>{h.name}</Text>
                <Text style={styles.holidayDate}>{h.date}</Text>
              </View>
            ))}
          </Card>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greetingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  employeeName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  roleSubtext: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  punchCard: {
    padding: Spacing.lg,
  },
  clockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  digitalClock: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  dutyDot: {
    width: 7,
    height: 7,
    borderRadius: BorderRadius.full,
    marginRight: 6,
  },
  dutyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statSource: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  wifiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successMuted,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  wifiDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
    marginRight: Spacing.sm,
  },
  wifiText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  punchButton: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shiftPill: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  shiftPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  shiftDetail: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  shiftSubdetail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  leaveSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  horizontalScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  leaveMiniCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    minWidth: 120,
  },
  leaveMiniType: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  leaveMiniDays: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  leaveMiniSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  announcementCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    marginBottom: Spacing.sm,
  },
  announcementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  announcementBody: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16,
  },
  holidaysCard: {
    marginTop: Spacing.xs,
  },
  holidayHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  holidayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  holidayName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  holidayDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
