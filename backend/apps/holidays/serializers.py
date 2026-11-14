from rest_framework import serializers
from .models import Holiday


class HolidaySerializer(serializers.ModelSerializer):
    office_name = serializers.ReadOnlyField(source='office.name')

    class Meta:
        model = Holiday
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted']
