import pytest
from decimal import Decimal
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.attendance.services import calculate_haversine_distance, verify_office_geofence, record_punch
from apps.attendance.models import AttendanceRecord, AttendanceEvent
from apps.organizations.models import Organization, Office
from apps.employees.models import Employee
from apps.accounts.models import User
from apps.departments.models import Department, Designation


@pytest.mark.django_db
class TestGeofencing:
    def setup_method(self):
        self.org = Organization.objects.create(name="Geo Tech", slug="geo-tech")
        # Office located at San Francisco Market St: 37.774929, -122.419416, geofence radius 200m
        self.office = Office.objects.create(
            organization=self.org,
            name="SF HQ",
            latitude=Decimal("37.774929"),
            longitude=Decimal("-122.419416"),
            radius_meters=150,
            geofence_radius_meters=200
        )
        self.dept = Department.objects.create(organization=self.org, name="Engineering")
        self.desig = Designation.objects.create(organization=self.org, department=self.dept, title="Engineer")
        self.user = User.objects.create_user(
            email="geo@test.com",
            password="GeoPassword123!",
            organization=self.org,
            role="EMPLOYEE"
        )
        self.emp = Employee.objects.create(
            organization=self.org,
            user=self.user,
            employee_code="EMP-GEO-001",
            first_name="Geo",
            last_name="Tester",
            work_email="geo@test.com",
            joining_date=timezone.localdate(),
            department=self.dept,
            designation=self.desig,
            office=self.office
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_haversine_distance_calculation(self):
        # Point 1: SF HQ (37.774929, -122.419416)
        # Point 2: 50 meters away (approx 37.775379, -122.419416)
        dist = calculate_haversine_distance(37.774929, -122.419416, 37.775379, -122.419416)
        assert dist is not None
        assert 45.0 <= dist <= 55.0

    def test_check_in_within_geofence_promotes_source_to_mobile_geofence(self):
        # Punch 30 meters away from SF HQ
        lat = 37.775199
        lng = -122.419416

        response = self.client.post('/api/v1/attendance/check-in/', {
            "latitude": lat,
            "longitude": lng,
            "device_info": "iPhone 15 Pro"
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data['geofence']['verified'] is True
        assert data['geofence']['office_name'] == "SF HQ"
        assert data['geofence']['distance_meters'] < 200

        record = AttendanceRecord.objects.get(employee=self.emp, attendance_date=timezone.localdate())
        assert record.source == 'MOBILE_GEOFENCE'

        event = AttendanceEvent.objects.filter(employee=self.emp, event_type='CHECK_IN').first()
        assert event.source == 'MOBILE_GEOFENCE'
        assert event.metadata['geofence']['verified'] is True

    def test_check_in_outside_geofence_soft_mode_keeps_mobile_app(self):
        # Punch 5km away (Oakland / distant)
        lat = 37.804363
        lng = -122.271111

        response = self.client.post('/api/v1/attendance/check-in/', {
            "latitude": lat,
            "longitude": lng,
            "device_info": "Android Device"
        })
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data['geofence']['verified'] is False
        assert data['geofence']['distance_meters'] > 1000

        event = AttendanceEvent.objects.filter(employee=self.emp, event_type='CHECK_IN').first()
        assert event.source == 'MOBILE_APP'

    def test_check_in_outside_geofence_strict_mode_rejects(self):
        # Punch far away with enforce_geofence=True
        lat = 37.804363
        lng = -122.271111

        response = self.client.post('/api/v1/attendance/check-in/', {
            "latitude": lat,
            "longitude": lng,
            "enforce_geofence": True
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Outside authorized office geofence" in data['detail']
        assert data['geofence']['verified'] is False
