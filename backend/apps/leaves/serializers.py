from rest_framework import serializers
from .models import LeaveType, LeaveBalance, LeaveRequest


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted']


class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.ReadOnlyField(source='leave_type.name')
    leave_type_code = serializers.ReadOnlyField(source='leave_type.code')
    is_paid = serializers.ReadOnlyField(source='leave_type.is_paid')

    class Meta:
        model = LeaveBalance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.ReadOnlyField(source='employee.employee_code')
    department_name = serializers.ReadOnlyField(source='employee.department.name')
    leave_type_name = serializers.ReadOnlyField(source='leave_type.name')
    reviewer_email = serializers.ReadOnlyField(source='reviewed_by.email')

    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = ['id', 'employee', 'total_days', 'status', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
