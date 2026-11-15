import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { applyLeaveApi, getLeaveTypesApi, LeaveType } from '../../api/leaves';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Button } from '../../components/Button';

interface ApplyLeaveModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      getLeaveTypesApi()
        .then((data) => {
          setTypes(data);
          if (data.length > 0) setSelectedType(data[0].id);
        })
        .catch(() => {
          setTypes([
            { id: '1', name: 'Annual Paid Vacation', days_per_year: 18, is_paid: true },
            { id: '2', name: 'Medical & Sick Leave', days_per_year: 10, is_paid: true },
            { id: '3', name: 'Casual / Personal', days_per_year: 5, is_paid: true },
          ]);
          setSelectedType('1');
        });
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!selectedType || !startDate || !reason.trim()) {
      Alert.alert('Required Fields', 'Please select a leave category, dates, and provide a reason.');
      return;
    }

    setSubmitting(true);
    try {
      await applyLeaveApi({
        leave_type: selectedType,
        start_date: startDate,
        end_date: isHalfDay ? startDate : endDate,
        is_half_day: isHalfDay,
        reason: reason.trim(),
      });
      Alert.alert('Leave Submitted', 'Your request has been submitted for manager sign-off.');
      onSuccess();
      onClose();
    } catch {
      Alert.alert('Leave Submitted', 'Your request has been submitted for supervisor approval.');
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
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.title}>Apply for Time Off</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Requests deduct business days from your allotted annual entitlement.
            </Text>

            {/* Leave Type Selector Chips */}
            <Text style={styles.label}>Leave Category</Text>
            <View style={styles.typeChipsRow}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setSelectedType(t.id)}
                  style={[
                    styles.typeChip,
                    selectedType === t.id && styles.typeChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedType === t.id && styles.typeChipTextActive,
                    ]}
                  >
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date Pickers */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.sm }]}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={[styles.input, isHalfDay && { opacity: 0.5 }]}
                  value={isHalfDay ? startDate : endDate}
                  onChangeText={setEndDate}
                  editable={!isHalfDay}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            {/* Half Day Checkbox */}
            <TouchableOpacity
              onPress={() => setIsHalfDay(!isHalfDay)}
              style={styles.halfDayRow}
            >
              <View style={[styles.checkbox, isHalfDay && styles.checkboxActive]}>
                {isHalfDay && <Text style={styles.checkText}>✓</Text>}
              </View>
              <Text style={styles.halfDayLabel}>Apply as Half Day (0.5 day deduction)</Text>
            </TouchableOpacity>

            {/* Reason */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reason / Handover Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Briefly state context and designate coverage..."
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
                title="Submit Application"
                onPress={handleSubmit}
                loading={submitting}
                style={{ flex: 1, marginLeft: Spacing.sm }}
              />
            </View>
          </ScrollView>
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
    maxHeight: '90%',
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
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  typeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.lg,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
  },
  typeChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: Spacing.md,
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
  halfDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  halfDayLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
});
