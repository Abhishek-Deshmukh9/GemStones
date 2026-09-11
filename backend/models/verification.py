import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class VerificationCheck(Base):
    __tablename__ = "verification_checks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=True, index=True)
    
    portal_name = Column(String(32), nullable=False)  # GSTN, MCA21, UDYAM, EPFO, ESIC, GEM_WATCHLIST
    check_type = Column(String(64), nullable=False)   # STATUS_ACTIVE, NAME_MATCH, ADDRESS_MATCH, FILING_CURRENT, CHECKSUM_VALID
    status = Column(String(16), default="PENDING")    # PASSED, FAILED, WARNING, PENDING
    confidence_score = Column(Float, default=1.0)
    
    extracted_value = Column(Text, nullable=True)     # JSON string of bidder's claimed data
    portal_value = Column(Text, nullable=True)        # JSON string of official portal response
    discrepancy_details = Column(Text, nullable=True) # Explanation of any mismatch
    
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    bidder = relationship("Bidder", back_populates="verification_checks")
    tender = relationship("Tender", back_populates="verification_checks")
