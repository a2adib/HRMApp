import pytest
from rest_framework.test import APIClient
from rest_framework import status


@pytest.mark.django_db
class TestHealthEndpoints:
    def setup_method(self):
        self.client = APIClient()

    def test_healthz_liveness_probe(self):
        response = self.client.get('/healthz/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['status'] == 'healthy'
        assert data['service'] == 'hrm-backend'
        assert 'timestamp' in data

    def test_healthz_api_v1_alias(self):
        response = self.client.get('/api/v1/healthz/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data['status'] == 'healthy'

    def test_readyz_readiness_probe_with_database(self):
        response = self.client.get('/readyz/')
        # If DB is up, status 200; if redis is not running in test env, status 200 or 503 depending on redis
        data = response.json()
        assert 'checks' in data
        assert data['checks']['database'] is True
        assert 'details' in data
