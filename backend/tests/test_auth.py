import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.organizations.models import Organization


@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()
        self.org, _ = Organization.objects.get_or_create(
            slug='auth-test-org',
            defaults={'name': 'Auth Test Org', 'timezone': 'UTC'}
        )
        self.user = User.objects.create_user(
            email='test.employee@acme.com',
            password='TestPassword123!',
            organization=self.org,
            role='EMPLOYEE'
        )

    def test_login_success(self):
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'test.employee@acme.com',
            'password': 'TestPassword123!'
        })
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == 'test.employee@acme.com'
        assert response.data['user']['role'] == 'EMPLOYEE'

    def test_login_invalid_password(self):
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'test.employee@acme.com',
            'password': 'WrongPassword!'
        })
        assert response.status_code == 401

    def test_token_refresh(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'test.employee@acme.com',
            'password': 'TestPassword123!'
        })
        refresh_token = login_res.data['refresh']

        refresh_res = self.client.post('/api/v1/auth/refresh/', {
            'refresh': refresh_token
        })
        assert refresh_res.status_code == 200
        assert 'access' in refresh_res.data

    def test_current_user_profile_me(self):
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'test.employee@acme.com',
            'password': 'TestPassword123!'
        })
        access_token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        me_res = self.client.get('/api/v1/auth/me/')
        assert me_res.status_code == 200
        assert me_res.data['email'] == 'test.employee@acme.com'
        assert me_res.data['organization']['name'] == 'Auth Test Org'
