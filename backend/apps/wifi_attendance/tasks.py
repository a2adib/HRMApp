import logging
from celery import shared_task
from django.utils import timezone
from apps.organizations.models import Organization
from .models import WiFiSession
from .services import process_staged_wifi_sessions, reconcile_daily_attendance

logger = logging.getLogger(__name__)


@shared_task(name='wifi_attendance.process_pending_sessions')
def process_pending_wifi_sessions_task(organization_id=None):
    """
    Asynchronous task to process pending staged WiFiSessions across organizations.
    """
    logger.info("Executing process_pending_wifi_sessions_task...")
    query = WiFiSession.objects.filter(status='PENDING')
    if organization_id:
        query = query.filter(organization_id=organization_id)

    pending = list(query[:500])  # Batch size 500
    if not pending:
        logger.info("No pending WiFi sessions to process.")
        return 0

    processed_count = process_staged_wifi_sessions(pending)
    logger.info(f"Processed {processed_count} WiFi sessions.")
    return processed_count


@shared_task(name='wifi_attendance.nightly_reconciliation')
def nightly_attendance_reconciliation_task(target_date_str=None):
    """
    Scheduled nightly reconciliation task to close open shifts, calculate
    absenteeism, and finalize previous day's attendance ledger.
    """
    logger.info("Starting nightly attendance reconciliation task...")
    import datetime
    target_date = None
    if target_date_str:
        target_date = datetime.date.fromisoformat(target_date_str)

    total_reconciled = reconcile_daily_attendance(target_date=target_date)
    logger.info(f"Nightly attendance reconciliation complete. Records finalized: {total_reconciled}")
    return total_reconciled
