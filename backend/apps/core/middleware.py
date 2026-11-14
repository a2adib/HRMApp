import uuid
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from .context import set_current_tenant_id, reset_current_tenant_id


class TenantContextMiddleware(MiddlewareMixin):
    """
    Extracts organization ID from authenticated user / JWT claims
    and binds it to thread-local contextvars for tenant scoping.
    """
    def process_request(self, request):
        request.tenant = None
        request.tenant_id = None
        token_context = None

        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            # Try to authenticate JWT eagerly if present
            header = request.headers.get('Authorization')
            if header and header.startswith('Bearer '):
                try:
                    auth = JWTAuthentication()
                    validated_token = auth.get_validated_token(header.split(' ')[1])
                    user = auth.get_user(validated_token)
                    request.user = user
                except Exception:
                    pass

        if user and user.is_authenticated:
            # Check user.organization
            if hasattr(user, 'organization') and user.organization:
                request.tenant = user.organization
                request.tenant_id = user.organization.id
                token_context = set_current_tenant_id(user.organization.id)
            elif hasattr(user, 'organization_id') and user.organization_id:
                request.tenant_id = user.organization_id
                token_context = set_current_tenant_id(user.organization_id)

        # Allow explicit header override if superuser
        org_override = request.headers.get('X-Organization-ID')
        if org_override and user and user.is_superuser:
            try:
                override_uuid = uuid.UUID(org_override)
                request.tenant_id = override_uuid
                token_context = set_current_tenant_id(override_uuid)
            except ValueError:
                pass

        request._tenant_context_token = token_context

    def process_response(self, request, response):
        token_context = getattr(request, '_tenant_context_token', None)
        if token_context:
            reset_current_tenant_id(token_context)
        return response
