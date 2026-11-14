from rest_framework import serializers
from .models import Shift, EmployeeShift


class ShiftSerializer(serializers.ModelSerializer):
    assigned_count = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted']

    def get_assigned_count(self, obj):
        return obj.employee_assignments.filter(is_active=True).count()


class EmployeeShiftSerializer(serializers.ModelSerializer):
    shift_name = serializers.ReadOnlyField(source='shift.name')
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeShift
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted']

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
