from rest_framework import serializers
from .models import AttendanceRecord, AttendanceEvent, AttendanceAdjustment


class AttendanceEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceEvent
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.ReadOnlyField(source='employee.employee_code')
    department_name = serializers.ReadOnlyField(source='employee.department.name')
    shift_name = serializers.ReadOnlyField(source='shift.name')
    events = AttendanceEventSerializer(many=True, read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class AttendanceAdjustmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceAdjustment
        fields = '__all__'
        read_only_fields = ['id', 'requested_by', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']

    def get_employee_name(self, obj):
        return f"{obj.requested_by.first_name} {obj.requested_by.last_name}"

    def get_reviewer_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.email
        return None
