from rest_framework import viewsets, permissions
from apps.core.permissions import IsHRAdmin
from .models import Organization, Office, AccessPoint
from .serializers import OrganizationSerializer, OfficeSerializer, AccessPointSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Organization.objects.all()
        if self.request.user.organization:
            return Organization.objects.filter(id=self.request.user.organization.id)
        return Organization.objects.none()


class OfficeViewSet(viewsets.ModelViewSet):
    serializer_class = OfficeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Office.objects.all()
        if user.organization:
            return Office.objects.filter(organization=user.organization)
        return Office.objects.none()

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)


class AccessPointViewSet(viewsets.ModelViewSet):
    serializer_class = AccessPointSerializer
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AccessPoint.objects.all()
        if user.organization:
            return AccessPoint.objects.filter(organization=user.organization)
        return AccessPoint.objects.none()

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)
