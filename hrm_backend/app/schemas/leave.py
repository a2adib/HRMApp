from datetime import date, datetime
from pydantic import BaseModel


class LeaveCreate(BaseModel):
    from_date: date
    to_date: date
    reason: str


class LeaveStatusUpdate(BaseModel):
    status: str  # Approved | Rejected


class LeaveResponse(BaseModel):
    id: int
    username: str
    role: str
    from_date: date
    to_date: date
    reason: str
    status: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class LeaveListResponse(BaseModel):
    requests: list[LeaveResponse]
