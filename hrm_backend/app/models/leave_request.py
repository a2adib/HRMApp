from sqlalchemy import Column, Integer, String, Date, DateTime, func

from app.database import Base


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    reason = Column(String(500), nullable=False)
    status = Column(String(20), nullable=False, default="Pending")  # Pending | Approved | Rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
