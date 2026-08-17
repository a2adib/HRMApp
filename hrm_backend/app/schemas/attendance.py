from datetime import date, time
from pydantic import BaseModel


class MarkAttendanceResponse(BaseModel):
    success: bool
    message: str


class AttendanceResponse(BaseModel):
    id: int
    username: str
    role: str
    date: date
    time: time

    model_config = {"from_attributes": True}


class AttendanceLogsResponse(BaseModel):
    logs: list[AttendanceResponse]
