import datetime
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import LeaveBalance, LeaveRequest
from apps.attendance.models import AttendanceRecord


def calculate_business_days(start_date, end_date):
    """Counts non-weekend days between start_date and end_date (inclusive)."""
    current = start_date
    days = 0
    while current <= end_date:
        if current.weekday() < 5:  # Monday to Friday
            days += 1
        current += datetime.timedelta(days=1)
    return Decimal(str(days)) if days > 0 else Decimal('1.0')


@transaction.atomic
def apply_leave(employee, leave_type, start_date, end_date, reason, attachment_url=None):
    """
    Submits a leave request, checks balance, and allocates pending days.
    """
    if start_date > end_date:
        raise ValidationError("Start date cannot be after end date.")

    total_days = calculate_business_days(start_date, end_date)
    year = start_date.year

    # Check balance
    balance, _ = LeaveBalance.objects.get_or_create(
        organization=employee.organization,
        employee=employee,
        leave_type=leave_type,
        year=year,
        defaults={
            'allocated_days': leave_type.default_quota_days,
            'remaining_days': leave_type.default_quota_days,
        }
    )

    if balance.remaining_days < total_days:
        raise ValidationError(
            f"Insufficient leave balance. Requested: {total_days}, Available: {balance.remaining_days}"
        )

    # Reserve pending days
    balance.pending_days += total_days
    balance.remaining_days -= total_days
    balance.save()

    req = LeaveRequest.objects.create(
        organization=employee.organization,
        employee=employee,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        total_days=total_days,
        reason=reason,
        attachment_url=attachment_url,
        status='PENDING'
    )
    return req


@transaction.atomic
def approve_leave_request(leave_request, reviewer, review_notes=''):
    """
    Approves leave request, marks days in balance as used, and updates daily AttendanceRecords.
    """
    if leave_request.status != 'PENDING':
        raise ValidationError(f"Cannot approve leave request with status: {leave_request.status}")

    leave_request.status = 'APPROVED'
    leave_request.reviewed_by = reviewer
    leave_request.reviewed_at = timezone.now()
    leave_request.review_notes = review_notes
    leave_request.save()

    # Move balance from pending to used
    balance = LeaveBalance.objects.filter(
        employee=leave_request.employee,
        leave_type=leave_request.leave_type,
        year=leave_request.start_date.year
    ).first()

    if balance:
        balance.pending_days = max(0, balance.pending_days - leave_request.total_days)
        balance.used_days += leave_request.total_days
        balance.save()

    # Mark attendance records for the duration
    current = leave_request.start_date
    while current <= leave_request.end_date:
        if current.weekday() < 5:  # Skip weekends
            record, _ = AttendanceRecord.objects.get_or_create(
                organization=leave_request.organization,
                employee=leave_request.employee,
                attendance_date=current,
                defaults={
                    'status': 'ON_LEAVE',
                    'notes': f"Approved {leave_request.leave_type.name}",
                    'is_finalized': True,
                }
            )
            record.status = 'ON_LEAVE'
            record.notes = f"Approved {leave_request.leave_type.name}"
            record.is_finalized = True
            record.save()
        current += datetime.timedelta(days=1)

    return leave_request


@transaction.atomic
def reject_leave_request(leave_request, reviewer, review_notes=''):
    """
    Rejects leave request and restores pending balance back to remaining days.
    """
    if leave_request.status != 'PENDING':
        raise ValidationError(f"Cannot reject leave request with status: {leave_request.status}")

    leave_request.status = 'REJECTED'
    leave_request.reviewed_by = reviewer
    leave_request.reviewed_at = timezone.now()
    leave_request.review_notes = review_notes
    leave_request.save()

    # Restore balance
    balance = LeaveBalance.objects.filter(
        employee=leave_request.employee,
        leave_type=leave_request.leave_type,
        year=leave_request.start_date.year
    ).first()

    if balance:
        balance.pending_days = max(0, balance.pending_days - leave_request.total_days)
        balance.remaining_days += leave_request.total_days
        balance.save()

    return leave_request
