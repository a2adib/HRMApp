from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.core.permissions import IsHRAdmin
from apps.core.viewsets import TenantModelViewSet
from .models import Notification, Announcement
from .serializers import NotificationSerializer, AnnouncementSerializer


class NotificationViewSet(TenantModelViewSet):
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({"status": "marked as read"})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"status": "all notifications marked as read"})


class AnnouncementViewSet(TenantModelViewSet):
    serializer_class = AnnouncementSerializer
    queryset = Announcement.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHRAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            published_by=self.request.user
        )
