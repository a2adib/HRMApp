from rest_framework import serializers
from .models import Organization, Office, AccessPoint


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class OfficeSerializer(serializers.ModelSerializer):
    organization_name = serializers.ReadOnlyField(source='organization.name')

    class Meta:
        model = Office
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AccessPointSerializer(serializers.ModelSerializer):
    office_name = serializers.ReadOnlyField(source='office.name')

    class Meta:
        model = AccessPoint
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
