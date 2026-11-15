import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ChangePasswordModal } from './ChangePasswordModal';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const emp = user?.employee || {
    first_name: 'Alex',
    last_name: 'Rivera',
    employee_code: 'EMP-003',
    department_name: 'Engineering',
    designation_title: 'Senior Frontend Engineer',
    phone_number: '+1 (555) 234-5678',
    network_username: 'alex.rivera',
    mac_address: '4A:7B:9C:12:34:56',
    office_name: 'Global HQ - Manhattan',
    date_of_joining: '2024-03-01',
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card Header */}
        <View style={styles.profileHeader}>
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>
              {emp.first_name[0]}
              {emp.last_name[0]}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {emp.first_name} {emp.last_name}
          </Text>
          <Text style={styles.profileCode}>
            {emp.employee_code} • {(user?.role || 'EMPLOYEE').toUpperCase()}
          </Text>
          <Text style={styles.profileRole}>
            {emp.designation_title} • {emp.department_name}
          </Text>
        </View>

        {/* Employment Topology */}
        <Card>
          <Text style={styles.cardSectionTitle}>Employment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Work Email</Text>
            <Text style={styles.infoVal}>{user?.email || 'alex.rivera@acme-corp.com'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Work Office</Text>
            <Text style={styles.infoVal}>{emp.office_name || 'Global HQ - Manhattan'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reporting Manager</Text>
            <Text style={styles.infoVal}>Marcus Brody</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shift Schedule</Text>
            <Text style={styles.infoVal}>Standard Day (09:00 - 18:00)</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Date Joined</Text>
            <Text style={styles.infoVal}>{emp.date_of_joining || '2024-03-01'}</Text>
          </View>
        </Card>

        {/* Wi-Fi Identity Card */}
        <Card style={styles.wifiCard}>
          <Text style={styles.cardSectionTitle}>Wi-Fi Attendance Identity</Text>
          <Text style={styles.wifiSubtitle}>
            Your device is automatically authenticated via corporate 802.1X RADIUS access points.
          </Text>

          <View style={styles.wifiField}>
            <Text style={styles.wifiLabel}>802.1X Network Username</Text>
            <Text style={styles.wifiCode}>{emp.network_username || 'alex.rivera'}</Text>
          </View>

          <View style={[styles.wifiField, { marginBottom: 0 }]}>
            <Text style={styles.wifiLabel}>Registered Device MAC Address</Text>
            <Text style={styles.wifiCode}>{emp.mac_address || '4A:7B:9C:12:34:56'}</Text>
          </View>
        </Card>

        {/* Security & Password */}
        <Card>
          <Text style={styles.cardSectionTitle}>Security & Credentials</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowPasswordModal(true)}
          >
            <View>
              <Text style={styles.actionTitle}>Change Password</Text>
              <Text style={styles.actionSub}>Update your mobile portal login password</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textStyle={{ color: Colors.danger }}
        />

        <Text style={styles.versionText}>Acme Global HRM Mobile • Version 1.0.0 (Build 42)</Text>
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: Spacing.md,
  },
  largeAvatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  profileCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  profileRole: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  wifiCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  wifiSubtitle: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  wifiField: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: Spacing.sm,
  },
  wifiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  wifiCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14532D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actionArrow: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '800',
  },
  logoutBtn: {
    marginTop: Spacing.md,
    borderColor: Colors.dangerBorder,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
