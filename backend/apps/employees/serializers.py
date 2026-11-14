from rest_framework import serializers
from django.db import transaction
from apps.accounts.models import User
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    designation_title = serializers.ReadOnlyField(source='designation.title')
    office_name = serializers.ReadOnlyField(source='office.name')
    manager_name = serializers.SerializerMethodField()
    role = serializers.CharField(write_only=True, required=False, default='EMPLOYEE')
    password = serializers.CharField(write_only=True, required=False, default='Welcome123!')

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_code', 'first_name', 'last_name', 'work_email',
            'phone_number', 'gender', 'date_of_birth', 'joining_date',
            'employment_status', 'department', 'department_name',
            'designation', 'designation_title', 'office', 'office_name',
            'manager', 'manager_name', 'network_username', 'avatar_url',
            'role', 'password', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}"
        return None

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop('role', 'EMPLOYEE')
        password = validated_data.pop('password', 'Welcome123!')
        organization = validated_data.get('organization') or getattr(self.context['request'], 'tenant', None)

        # Create linked user
        user, created = User.objects.get_or_create(
            email=validated_data['work_email'],
            defaults={
                'organization': organization,
                'role': role,
            }
        )
        if created:
            user.set_password(password)
            user.save()

        validated_data['user'] = user
        validated_data['organization'] = organization
        employee = super().create(validated_data)

        # Initialize leave balances for current year if leave types exist
        from apps.leaves.models import LeaveType, LeaveBalance
        from django.utils import timezone
        current_year = timezone.now().year
        leave_types = LeaveType.objects.filter(organization=organization, is_deleted=False)
        for lt in leave_types:
            LeaveBalance.objects.get_or_create(
                organization=organization,
                employee=employee,
                leave_type=lt,
                year=current_year,
                defaults={
                    'allocated_days': lt.default_quota_days,
                    'remaining_days': lt.default_quota_days,
                }
            )

        return employee
