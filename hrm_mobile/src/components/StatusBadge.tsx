import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface StatusBadgeProps {
  status: string;
  type?: 'attendance' | 'leave';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'attendance' }) => {
  const s = (status || '').toUpperCase();

  let bg = Colors.background;
  let text = Colors.textSecondary;
  let border = Colors.border;
  let label = s;

  if (s === 'PRESENT') {
    bg = Colors.successMuted;
    text = Colors.success;
    border = Colors.successBorder;
    label = 'Present';
  } else if (s === 'LATE') {
    bg = Colors.warningMuted;
    text = Colors.warning;
    border = Colors.warningBorder;
    label = 'Late';
  } else if (s === 'HALF_DAY') {
    bg = Colors.infoMuted;
    text = Colors.info;
    border = Colors.infoBorder;
    label = 'Half Day';
  } else if (s === 'ABSENT') {
    bg = Colors.dangerMuted;
    text = Colors.danger;
    border = Colors.dangerBorder;
    label = 'Absent';
  } else if (s === 'ON_LEAVE') {
    bg = Colors.purpleMuted;
    text = Colors.purple;
    border = Colors.purpleBorder;
    label = 'On Leave';
  } else if (s === 'APPROVED') {
    bg = Colors.successMuted;
    text = Colors.success;
    border = Colors.successBorder;
    label = 'Approved';
  } else if (s === 'PENDING') {
    bg = Colors.warningMuted;
    text = Colors.warning;
    border = Colors.warningBorder;
    label = 'Pending Review';
  } else if (s === 'REJECTED') {
    bg = Colors.dangerMuted;
    text = Colors.danger;
    border = Colors.dangerBorder;
    label = 'Rejected';
  } else if (s === 'CANCELLED') {
    bg = '#F1F5F9';
    text = '#64748B';
    border = '#CBD5E1';
    label = 'Cancelled';
  }

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
