import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tender_id = Column(String(64), unique=True, nullable=False, index=True)
    tender_title = Column(Text, nullable=False)
    organisation = Column(String(255), nullable=True)
    ministry_department = Column(String(255), nullable=True)
    tender_category = Column(String(64), nullable=True)
    published_date = Column(DateTime, nullable=True)
    closing_date = Column(DateTime, nullable=True)
    emd = Column(Float, default=0.0)
    required_checks = Column(Text, nullable=True)
    tender_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    tender_bidders = relationship("TenderBidder", back_populates="tender", cascade="all, delete-orphan")
    verification_checks = relationship("VerificationCheck", back_populates="tender", cascade="all, delete-orphan")

class TenderBidder(Base):
    __tablename__ = "tender_bidders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False, index=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False, index=True)
    overall_status = Column(String(32), default="PENDING")
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="tender_bidders")
    bidder = relationship("Bidder")
