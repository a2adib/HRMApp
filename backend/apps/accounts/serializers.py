from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        if user.organization_id:
            token['organization_id'] = str(user.organization_id)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        # Structure user details in response
        data['user'] = {
            'id': str(user.id),
            'email': user.email,
            'role': user.role,
        }

        if user.organization:
            data['user']['organization'] = {
                'id': str(user.organization.id),
                'name': user.organization.name,
                'slug': user.organization.slug,
                'timezone': user.organization.timezone,
            }

        # Check for linked employee
        employee = getattr(user, 'employee', None)
        if employee:
            data['user']['employee'] = {
                'id': str(employee.id),
                'employee_code': employee.employee_code,
                'first_name': employee.first_name,
                'last_name': employee.last_name,
                'avatar_url': employee.avatar_url,
                'network_username': employee.network_username,
                'department': employee.department.name if employee.department else None,
                'designation': employee.designation.title if employee.designation else None,
            }

        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'organization', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()
    employee = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active', 'organization', 'employee']

    def get_organization(self, obj):
        if not obj.organization:
            return None
        return {
            'id': str(obj.organization.id),
            'name': obj.organization.name,
            'slug': obj.organization.slug,
            'timezone': obj.organization.timezone,
            'logo_url': obj.organization.logo_url,
        }

    def get_employee(self, obj):
        emp = getattr(obj, 'employee', None)
        if not emp:
            return None
        return {
            'id': str(emp.id),
            'employee_code': emp.employee_code,
            'first_name': emp.first_name,
            'last_name': emp.last_name,
            'work_email': emp.work_email,
            'phone_number': emp.phone_number,
            'department_id': str(emp.department_id) if emp.department_id else None,
            'department_name': emp.department.name if emp.department else None,
            'designation_id': str(emp.designation_id) if emp.designation_id else None,
            'designation_title': emp.designation.title if emp.designation else None,
            'office_id': str(emp.office_id) if emp.office_id else None,
            'office_name': emp.office.name if emp.office else None,
            'manager_id': str(emp.manager_id) if emp.manager_id else None,
            'manager_name': f"{emp.manager.first_name} {emp.manager.last_name}" if emp.manager else None,
            'network_username': emp.network_username,
            'avatar_url': emp.avatar_url,
            'employment_status': emp.employment_status,
        }
