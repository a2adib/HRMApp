import contextvars
from typing import Optional
import uuid

_current_tenant_id: contextvars.ContextVar[Optional[uuid.UUID]] = contextvars.ContextVar(
    "current_tenant_id", default=None
)

def set_current_tenant_id(tenant_id: Optional[uuid.UUID]):
    return _current_tenant_id.set(tenant_id)

def get_current_tenant_id() -> Optional[uuid.UUID]:
    return _current_tenant_id.get()

def reset_current_tenant_id(token):
    _current_tenant_id.reset(token)
