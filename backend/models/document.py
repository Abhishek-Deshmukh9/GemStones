import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=True, index=True)
    
    doc_type = Column(String(32), nullable=False)   # GST_REG_06, UDYAM_CERT, MCA_COI, PAN_CARD, ITR_V, EPFO_CHALLAN
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    mime_type = Column(String(64), default="application/pdf")
    
    # LLM / OCR Extracted data
    extracted_data = Column(Text, nullable=True)     # JSON string of extracted fields
    extraction_confidence = Column(Float, default=0.0)
    extraction_model = Column(String(64), default="gemini-3.7-flash")
    tampering_suspected = Column(Boolean, default=False)
    tampering_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    bidder = relationship("Bidder", back_populates="documents")
