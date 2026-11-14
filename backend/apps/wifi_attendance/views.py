from django.conf import settings
from rest_framework.views import APIView
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from apps.organizations.models import Organization
from apps.core.permissions import IsHRAdmin
from apps.core.viewsets import TenantModelViewSet
from .models import WiFiSession
from .services import ingest_wifi_event_batch
from rest_framework import serializers


class WiFiSessionSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    access_point_name = serializers.ReadOnlyField(source='access_point.name')

    class Meta:
        model = WiFiSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_employee_name(self, obj):
        if obj.employee:
            return f"{obj.employee.first_name} {obj.employee.last_name}"
        return None


class InternalWiFiEventsView(APIView):
    """
    Internal M2M Ingestion endpoint for RADIUS accounting events.
    Requires X-Service-Token header for machine authentication.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.headers.get('X-Service-Token')
        expected_token = getattr(settings, 'WIFI_INGESTION_SERVICE_TOKEN', 'insecure-default-token')

        if not token or token != expected_token:
            return Response(
                {"detail": "Invalid or missing internal service token."},
                status=status.HTTP_403_FORBIDDEN
            )

        org_id = request.data.get('organization_id')
        if not org_id:
            org = Organization.objects.first()
        else:
            org = Organization.objects.filter(id=org_id).first()

        if not org:
            return Response({"detail": "Organization not found."}, status=status.HTTP_404_NOT_FOUND)

        events = request.data.get('events', [])
        batch_id = request.data.get('batch_id', 'unassigned')

        received_count, processed_count = ingest_wifi_event_batch(org, events)

        return Response({
            "status": "ACCEPTED",
            "batch_id": batch_id,
            "events_received": received_count,
            "events_processed": processed_count,
        }, status=status.HTTP_202_ACCEPTED)


class WiFiSessionViewSet(TenantModelViewSet):
    serializer_class = WiFiSessionSerializer
    queryset = WiFiSession.objects.all().select_related('access_point', 'employee')
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]
    filterset_fields = ['status', 'access_point', 'employee', 'raw_username']
