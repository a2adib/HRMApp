from rest_framework import serializers
from .models import Notification, Announcement


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AnnouncementSerializer(serializers.ModelSerializer):
    publisher_name = serializers.ReadOnlyField(source='published_by.email')
    department_name = serializers.ReadOnlyField(source='target_department.name')

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['id', 'published_by', 'publish_date', 'created_at', 'updated_at']
