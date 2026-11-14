from rest_framework import permissions


class IsTenantScoped(permissions.BasePermission):
    """
    Ensures that object-level operations are strictly restricted
    to the organization associated with the authenticated user.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        tenant_id = getattr(request, 'tenant_id', None)
        if not tenant_id:
            return False
        obj_org_id = getattr(obj, 'organization_id', None)
        if obj_org_id:
            return str(obj_org_id) == str(tenant_id)
        return True


class IsHRAdmin(permissions.BasePermission):
    """Allows access only to HR Administrators or Superusers."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.role == 'HR_ADMIN'


class IsManagerOrHRAdmin(permissions.BasePermission):
    """Allows access to Managers, HR Administrators, or Superusers."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.role in ['HR_ADMIN', 'MANAGER']


class IsEmployee(permissions.BasePermission):
    """Allows access to authenticated employees."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
