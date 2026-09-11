import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=True, index=True)
    
    action = Column(String(128), nullable=False)   # e.g., VERIFICATION_RUN, RISK_CALCULATED, OFFICER_OVERRIDE, DOC_UPLOAD
    actor = Column(String(128), default="SYSTEM")  # SYSTEM, OFFICER, ADMIN
    details = Column(Text, nullable=True)          # JSON or text description
    ip_address = Column(String(45), nullable=True)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    bidder = relationship("Bidder", back_populates="audit_logs")
