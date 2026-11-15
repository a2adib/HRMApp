import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  getLeaveBalancesApi,
  getLeaveRequestsApi,
  LeaveBalance,
  LeaveRequestItem,
} from '../../api/leaves';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { ApplyLeaveModal } from './ApplyLeaveModal';

export default function LeaveScreen() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const loadLeaveData = async () => {
    try {
      const [bals, reqs] = await Promise.all([
        getLeaveBalancesApi().catch(() => []),
        getLeaveRequestsApi().catch(() => []),
      ]);

      setBalances(
        bals.length > 0
          ? bals
          : [
              { id: '1', leave_type_name: 'Annual Paid Vacation', remaining_days: 14, used_days: 1, pending_days: 3, total_allocated: 18 },
              { id: '2', leave_type_name: 'Medical & Sick Leave', remaining_days: 8, used_days: 2, pending_days: 0, total_allocated: 10 },
              { id: '3', leave_type_name: 'Casual / Personal', remaining_days: 3, used_days: 2, pending_days: 0, total_allocated: 5 },
            ]
      );

      setRequests(
        reqs.length > 0
          ? reqs
          : [
              {
                id: '1',
                leave_type_name: 'Annual Paid Vacation',
                start_date: '2026-04-10',
                end_date: '2026-04-14',
                total_days: 3,
                is_half_day: false,
                reason: 'Family spring vacation trip',
                status: 'PENDING',
                created_at: new Date().toISOString(),
              },
              {
                id: '2',
                leave_type_name: 'Medical & Sick Leave',
                start_date: '2026-02-18',
                end_date: '2026-02-18',
                total_days: 1,
                is_half_day: false,
                reason: 'Dental appointment & surgery',
                status: 'APPROVED',
                created_at: '2026-02-15T10:00:00Z',
              },
              {
                id: '3',
                leave_type_name: 'Casual / Personal',
                start_date: '2026-01-22',
                end_date: '2026-01-22',
                total_days: 0.5,
                is_half_day: true,
                reason: 'Home utility maintenance',
                status: 'APPROVED',
                created_at: '2026-01-20T14:30:00Z',
              },
            ]
      );
    } catch (err) {
      console.error('Error fetching mobile leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaveData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Title Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Time Off & Leaves</Text>
            <Text style={styles.subtitle}>Annual entitlements & request history</Text>
          </View>

          <Button
            title="+ Apply"
            onPress={() => setShowApplyModal(true)}
            style={styles.applyBtn}
            textStyle={{ fontSize: 13 }}
          />
        </View>

        {/* Leave Balances Cards */}
        <Text style={styles.sectionHeader}>Leave Balances</Text>

        <View style={styles.balancesContainer}>
          {balances.map((b) => (
            <Card key={b.id} style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceType}>{b.leave_type_name}</Text>
                <View style={styles.remainingPill}>
                  <Text style={styles.remainingPillText}>Available</Text>
                </View>
              </View>

              <View style={styles.daysBigRow}>
                <Text style={styles.daysBigNumber}>{b.remaining_days}</Text>
                <Text style={styles.daysBigUnit}>days left</Text>
              </View>

              <View style={styles.balanceFooter}>
                <View style={styles.balanceFooterCol}>
                  <Text style={styles.subLabel}>TOTAL</Text>
                  <Text style={styles.subVal}>{b.total_allocated}d</Text>
                </View>
                <View style={styles.balanceFooterDivider} />
                <View style={styles.balanceFooterCol}>
                  <Text style={styles.subLabel}>USED</Text>
                  <Text style={[styles.subVal, { color: Colors.danger }]}>{b.used_days}d</Text>
                </View>
                <View style={styles.balanceFooterDivider} />
                <View style={styles.balanceFooterCol}>
                  <Text style={styles.subLabel}>PENDING</Text>
                  <Text style={[styles.subVal, { color: Colors.warning }]}>{b.pending_days}d</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Request History */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          Request History
        </Text>

        {requests.map((r) => (
          <Card key={r.id} style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <View>
                <Text style={styles.reqType}>{r.leave_type_name}</Text>
                <Text style={styles.reqDates}>
                  {r.start_date} {r.start_date !== r.end_date ? `→ ${r.end_date}` : ''}
                </Text>
              </View>
              <StatusBadge status={r.status} type="leave" />
            </View>

            <Text style={styles.reqReason}>"{r.reason}"</Text>

            <View style={styles.reqFooter}>
              <Text style={styles.reqDuration}>
                {r.total_days} {r.total_days === 1 ? 'day' : 'days'}{' '}
                {r.is_half_day ? '(Half-Day)' : ''}
              </Text>
              <Text style={styles.reqSubmitted}>
                Submitted {new Date(r.created_at).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => loadLeaveData()}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  },
  applyBtn: {
    height: 38,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  balancesContainer: {
    gap: Spacing.md,
  },
  balanceCard: {
    padding: Spacing.lg,
    marginBottom: 0,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceType: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  remainingPill: {
    backgroundColor: Colors.successMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  remainingPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  daysBigRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: Spacing.md,
  },
  daysBigNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  daysBigUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 6,
  },
  balanceFooter: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  balanceFooterCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceFooterDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  subVal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  reqCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  reqType: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reqDates: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reqReason: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginVertical: Spacing.sm,
    lineHeight: 16,
  },
  reqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  reqDuration: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  reqSubmitted: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
