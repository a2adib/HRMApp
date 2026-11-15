import uuid
from django.db import models


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    domain = models.CharField(max_length=255, blank=True, null=True)
    timezone = models.CharField(max_length=64, default='UTC')
    logo_url = models.URLField(max_length=512, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['name']

    def __str__(self):
        return self.name


class Office(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='offices')
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    radius_meters = models.IntegerField(default=150)
    geofence_radius_meters = models.IntegerField(default=250, help_text="Allowed radius in meters for mobile check-in")
    timezone = models.CharField(max_length=64, default='UTC')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'offices'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class AccessPoint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='access_points')
    office = models.ForeignKey(Office, on_delete=models.CASCADE, related_name='access_points')
    name = models.CharField(max_length=255)
    mac_address = models.CharField(max_length=32, db_index=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    location_description = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'access_points'
        unique_together = ('organization', 'mac_address')
        ordering = ['name']

    def save(self, *args, **kwargs):
        if self.mac_address:
            # Normalize MAC to uppercase colon-separated
            clean_mac = self.mac_address.replace('-', ':').replace('.', '').upper()
            self.mac_address = clean_mac
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} [{self.mac_address}]"
