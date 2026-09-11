import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.bidder import Bidder
from ..models.verification import VerificationCheck
from ..models.document import Document
from ..models.audit import AuditLog
from ..schemas import BidderResponse, BidderCreate, OfficerDecisionRequest

router = APIRouter(prefix="/api/bidders", tags=["Bidders"])

@router.get("", response_model=List[BidderResponse])
def get_bidders(
    search: Optional[str] = Query(None, description="Search by name, GSTIN, or GeM Seller ID"),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    query = db.query(Bidder)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Bidder.company_name.ilike(search_filter)) |
            (Bidder.trade_name.ilike(search_filter)) |
            (Bidder.gstin.ilike(search_filter)) |
            (Bidder.gem_seller_id.ilike(search_filter)) |
            (Bidder.pan.ilike(search_filter))
        )
    if risk_level:
        query = query.filter(Bidder.risk_level == risk_level.upper())
    if status:
        query = query.filter(Bidder.verification_status == status.upper())
    
    return query.order_by(Bidder.id.asc()).all()

@router.get("/stats/summary")
def get_bidders_stats(db: Session = Depends(get_db)):
    """Summary statistics for the executive dashboard."""
    total = db.query(Bidder).count()
    low_risk = db.query(Bidder).filter(Bidder.risk_level == "LOW").count()
    medium_risk = db.query(Bidder).filter(Bidder.risk_level == "MEDIUM").count()
    high_risk = db.query(Bidder).filter(Bidder.risk_level == "HIGH").count()
    critical_risk = db.query(Bidder).filter(Bidder.risk_level == "CRITICAL").count()
    
    verified_bidders = db.query(Bidder).filter(Bidder.overall_score.isnot(None)).all()
    avg_score = round(sum(b.overall_score for b in verified_bidders) / len(verified_bidders), 1) if verified_bidders else None
    
    verified = db.query(Bidder).filter(Bidder.verification_status == "VERIFIED").count()
    flagged = db.query(Bidder).filter(Bidder.verification_status == "FLAGGED").count()
    rejected = db.query(Bidder).filter(Bidder.verification_status == "REJECTED").count()
    pending = db.query(Bidder).filter(Bidder.verification_status == "PENDING").count()

    return {
        "total_bidders": total,
        "avg_compliance_score": avg_score,
        "pending_count": pending,
        "risk_breakdown": {
            "low": low_risk,
            "medium": medium_risk,
            "high": high_risk,
            "critical": critical_risk,
            "pending": pending
        },
        "status_breakdown": {
            "verified": verified,
            "flagged": flagged,
            "rejected": rejected,
            "pending": pending
        }
    }

@router.get("/{bidder_id}")
def get_bidder_detail(bidder_id: int, db: Session = Depends(get_db)):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder with ID {bidder_id} not found")
    
    checks = db.query(VerificationCheck).filter(VerificationCheck.bidder_id == bidder_id).all()
    documents = db.query(Document).filter(Document.bidder_id == bidder_id).all()
    logs = db.query(AuditLog).filter(AuditLog.bidder_id == bidder_id).order_by(AuditLog.timestamp.desc()).all()

    return {
        "bidder": bidder,
        "checks": checks,
        "documents": documents,
        "audit_logs": logs
    }

@router.post("", response_model=BidderResponse)
def create_bidder(bidder_in: BidderCreate, db: Session = Depends(get_db)):
    existing = db.query(Bidder).filter(
        (Bidder.gstin == bidder_in.gstin) | (Bidder.gem_seller_id == bidder_in.gem_seller_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bidder with this GSTIN or GeM Seller ID already exists")

    bidder = Bidder(**bidder_in.model_dump())
    db.add(bidder)
    db.commit()
    db.refresh(bidder)

    # Add audit log
    audit = AuditLog(
        bidder_id=bidder.id,
        action="BIDDER_CREATED",
        actor="PORTAL_OFFICER",
        details=json.dumps({"company_name": bidder.company_name})
    )
    db.add(audit)
    db.commit()

    return bidder

@router.post("/{bidder_id}/decision")
def record_officer_decision(bidder_id: int, decision_in: OfficerDecisionRequest, db: Session = Depends(get_db)):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    decision = decision_in.decision.upper()
    if decision == "APPROVED":
        bidder.verification_status = "VERIFIED"
    elif decision == "REJECTED":
        bidder.verification_status = "REJECTED"
    elif decision == "FLAGGED_FOR_INSPECTION":
        bidder.verification_status = "FLAGGED"
    else:
        raise HTTPException(status_code=400, detail="Invalid decision value")

    audit = AuditLog(
        bidder_id=bidder.id,
        action=f"OFFICER_{decision}",
        actor=decision_in.officer_name,
        details=json.dumps({"notes": decision_in.notes, "status": bidder.verification_status})
    )
    db.add(audit)
    db.commit()
    db.refresh(bidder)

    return {
        "success": True,
        "bidder_id": bidder.id,
        "new_status": bidder.verification_status,
        "officer": decision_in.officer_name,
        "notes": decision_in.notes
    }
