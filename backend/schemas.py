from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

# --- Bidder Schemas ---
class BidderBase(BaseModel):
    company_name: str
    trade_name: Optional[str] = None
    gem_seller_id: str
    gstin: str
    pan: str
    cin: Optional[str] = None
    udyam_reg_number: Optional[str] = None
    msme_category: Optional[str] = None
    epfo_code: Optional[str] = None
    esic_number: Optional[str] = None
    registered_address: Optional[str] = None
    state_code: Optional[str] = None

class BidderCreate(BidderBase):
    pass

class BidderResponse(BidderBase):
    id: int
    risk_level: str
    overall_score: Optional[float] = None
    verification_status: str
    discrepancy_count: int
    ai_recommendation: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Verification Schemas ---
class VerificationCheckResponse(BaseModel):
    id: int
    bidder_id: int
    tender_id: Optional[int] = None
    portal_name: str
    check_type: str
    status: str
    confidence_score: float
    extracted_value: Optional[str] = None
    portal_value: Optional[str] = None
    discrepancy_details: Optional[str] = None
    checked_at: datetime

    class Config:
        from_attributes = True

class VerifyBidderRequest(BaseModel):
    force_refresh: bool = False
    tender_id: Optional[int] = None

class VerificationSummary(BaseModel):
    bidder_id: int
    company_name: str
    overall_score: float
    risk_level: str
    verification_status: str
    checks_total: int
    checks_passed: int
    checks_failed: int
    checks_warning: int
    ai_recommendation: Optional[str] = None
    checks: List[VerificationCheckResponse]

# --- Document Schemas ---
class DocumentResponse(BaseModel):
    id: int
    bidder_id: Optional[int] = None
    doc_type: str
    file_name: str
    file_path: str
    file_size_bytes: int
    mime_type: str
    extracted_data: Optional[str] = None
    extraction_confidence: float
    extraction_model: str
    tampering_suspected: bool
    tampering_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: int
    bidder_id: Optional[int] = None
    action: str
    actor: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Officer Action Schema ---
class OfficerDecisionRequest(BaseModel):
    decision: str = Field(..., description="APPROVED, REJECTED, FLAGGED_FOR_INSPECTION")
    notes: str = Field(..., description="Officer comments and justifications")
    officer_name: str = Field(default="Officer In-Charge", description="Name/ID of the procurement officer")

# --- Tender Schemas ---
class TenderBase(BaseModel):
    tender_id: str
    tender_title: str
    organisation: Optional[str] = None
    ministry_department: Optional[str] = None
    tender_category: Optional[str] = None
    published_date: Optional[datetime] = None
    closing_date: Optional[datetime] = None
    emd: float = 0.0
    required_checks: Optional[str] = None
    tender_json: Optional[str] = None

class TenderCreate(TenderBase):
    pass

class TenderBidderResponse(BaseModel):
    id: int
    tender_id: int
    bidder_id: int
    overall_status: str
    assigned_at: datetime
    bidder: Optional[BidderResponse] = None

    class Config:
        from_attributes = True

class TenderResponse(TenderBase):
    id: int
    created_at: datetime
    tender_bidders: List[TenderBidderResponse] = []

    class Config:
        from_attributes = True
