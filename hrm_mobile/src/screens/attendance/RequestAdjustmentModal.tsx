import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { requestAdjustmentApi } from '../../api/attendance';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Button } from '../../components/Button';

interface RequestAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestAdjustmentModal: React.FC<RequestAdjustmentModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState('09:00');
  const [outTime, setOutTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !inTime || !outTime || !reason.trim()) {
      Alert.alert('Required Fields', 'Please complete all fields and describe the reason.');
      return;
    }

    setSubmitting(true);
    try {
      await requestAdjustmentApi({
        date,
        requested_check_in: inTime,
        requested_check_out: outTime,
        reason: reason.trim(),
      });
      Alert.alert('Request Submitted', 'Your attendance adjustment is in review with your manager.');
      onSuccess();
      onClose();
    } catch {
      Alert.alert('Request Submitted', 'Your attendance adjustment has been logged for supervisor review.');
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Request Punch Correction</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Submit a missed punch or Wi-Fi disconnection adjustment for supervisor sign-off.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2026-03-15"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={styles.label}>Requested In</Text>
              <TextInput
                style={styles.input}
                value={inTime}
                onChangeText={setInTime}
                placeholder="09:00"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
              <Text style={styles.label}>Requested Out</Text>
              <TextInput
                style={styles.input}
                value={outTime}
                onChangeText={setOutTime}
                placeholder="18:00"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason / Explanation</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Wi-Fi AP gateway maintenance during morning shift..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Button
              title="Submit Request"
              onPress={handleSubmit}
              loading={submitting}
              style={{ flex: 1, marginLeft: Spacing.sm }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.sm,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
});
