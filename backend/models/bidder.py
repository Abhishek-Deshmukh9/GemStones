import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class Bidder(Base):
    __tablename__ = "bidders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(255), nullable=False, index=True)
    trade_name = Column(String(255), nullable=True)
    gem_seller_id = Column(String(64), unique=True, nullable=False, index=True)
    
    # Government Identifiers
    gstin = Column(String(15), unique=True, nullable=False, index=True)
    pan = Column(String(10), nullable=False, index=True)
    cin = Column(String(21), nullable=True, index=True)
    udyam_reg_number = Column(String(19), nullable=True, index=True)
    msme_category = Column(String(32), nullable=True)  # Micro, Small, Medium, Large
    epfo_code = Column(String(32), nullable=True)
    esic_number = Column(String(17), nullable=True)
    
    # Address and Location
    registered_address = Column(Text, nullable=True)
    state_code = Column(String(2), nullable=True)
    
    # Compliance & Risk Analysis
    risk_level = Column(String(16), default="PENDING")  # LOW, MEDIUM, HIGH, CRITICAL, PENDING
    overall_score = Column(Float, nullable=True, default=None)  # 0.0 to 100.0, None if pending
    verification_status = Column(String(32), default="PENDING")  # PENDING, VERIFIED, FLAGGED, REJECTED
    discrepancy_count = Column(Integer, default=0)
    ai_recommendation = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    verification_checks = relationship("VerificationCheck", back_populates="bidder", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="bidder", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="bidder")
