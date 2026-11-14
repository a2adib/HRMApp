import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.organizations.models import Organization
from apps.departments.models import Department


@pytest.mark.django_db
class TestTenantIsolation:
    def setup_method(self):
        self.client = APIClient()

        # Tenant A
        self.org_a = Organization.objects.create(name='Tenant Alpha', slug='tenant-alpha')
        self.user_a = User.objects.create_user(
            email='user@alpha.com',
            password='Password123!',
            organization=self.org_a,
            role='HR_ADMIN'
        )
        self.dept_a = Department.objects.create(
            organization=self.org_a,
            name='Alpha Engineering',
            code='ALPHA-ENG'
        )

        # Tenant B
        self.org_b = Organization.objects.create(name='Tenant Beta', slug='tenant-beta')
        self.user_b = User.objects.create_user(
            email='user@beta.com',
            password='Password123!',
            organization=self.org_b,
            role='HR_ADMIN'
        )
        self.dept_b = Department.objects.create(
            organization=self.org_b,
            name='Beta Operations',
            code='BETA-OPS'
        )

    def test_tenant_a_cannot_view_tenant_b_departments(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'user@alpha.com',
            'password': 'Password123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/v1/departments/')
        assert response.status_code == 200
        codes = [d['code'] for d in response.data['results']]
        assert 'ALPHA-ENG' in codes
        assert 'BETA-OPS' not in codes

    def test_tenant_b_cannot_view_tenant_a_departments(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'user@beta.com',
            'password': 'Password123!'
        })
        token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/v1/departments/')
        assert response.status_code == 200
        codes = [d['code'] for d in response.data['results']]
        assert 'BETA-OPS' in codes
        assert 'ALPHA-ENG' not in codes
