from django.utils import timezone
from django.db import connection
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import redis


class HealthzView(APIView):
    """
    Liveness probe: verifies the process is up and responding.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({
            "status": "healthy",
            "service": "hrm-backend",
            "timestamp": timezone.now().isoformat()
        }, status=status.HTTP_200_OK)


class ReadyzView(APIView):
    """
    Readiness probe: verifies dependencies (Database, Redis) are reachable.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        checks = {
            "database": False,
            "redis": False
        }
        details = {}

        # 1. Database check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                row = cursor.fetchone()
                if row and row[0] == 1:
                    checks["database"] = True
                    details["database"] = "reachable"
        except Exception as exc:
            details["database"] = f"unreachable: {str(exc)}"

        # 2. Redis check
        try:
            redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
            r = redis.from_url(redis_url, socket_timeout=2)
            if r.ping():
                checks["redis"] = True
                details["redis"] = "reachable"
        except Exception as exc:
            details["redis"] = f"unreachable: {str(exc)}"

        all_ready = all(checks.values())
        status_code = status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE

        return Response({
            "status": "ready" if all_ready else "degraded",
            "service": "hrm-backend",
            "timestamp": timezone.now().isoformat(),
            "checks": checks,
            "details": details
        }, status=status_code)
