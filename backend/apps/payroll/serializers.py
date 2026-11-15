from rest_framework import serializers
from .models import SalaryStructure, PayrollPeriod, Payslip
from apps.employees.serializers import EmployeeSerializer


class SalaryStructureSerializer(serializers.ModelSerializer):
    employee_code = serializers.ReadOnlyField(source='employee.employee_code')
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    total_allowances = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    gross_salary = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SalaryStructure
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_allowances', 'gross_salary']


class PayslipSerializer(serializers.ModelSerializer):
    employee_code = serializers.ReadOnlyField(source='employee.employee_code')
    employee_name = serializers.SerializerMethodField()
    department = serializers.ReadOnlyField(source='employee.department.name')
    designation = serializers.ReadOnlyField(source='employee.designation.title')
    period_label = serializers.SerializerMethodField()

    class Meta:
        model = Payslip
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'generated_at']

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_period_label(self, obj):
        return f"{obj.payroll_period.year}-{obj.payroll_period.month:02d}"


class PayrollPeriodSerializer(serializers.ModelSerializer):
    payslips_count = serializers.SerializerMethodField()
    processed_by_name = serializers.ReadOnlyField(source='processed_by.get_full_name')

    class Meta:
        model = PayrollPeriod
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_gross', 'total_deductions', 'total_net', 'processed_at']

    def get_payslips_count(self, obj):
        return obj.payslips.count()
