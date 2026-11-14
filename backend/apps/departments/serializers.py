from rest_framework import serializers
from .models import Department, Designation


class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = Designation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted']


class DepartmentSerializer(serializers.ModelSerializer):
    designations = DesignationSerializer(many=True, read_only=True)
    employee_count = serializers.SerializerMethodField()
    head_name = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted']

    def get_employee_count(self, obj):
        return obj.employees.filter(is_deleted=False).count()

    def get_head_name(self, obj):
        if obj.head_of_department:
            return f"{obj.head_of_department.first_name} {obj.head_of_department.last_name}"
        return None
