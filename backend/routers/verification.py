from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.bidder import Bidder
from ..models.tender import Tender, TenderBidder
from ..services.compliance_engine import evaluate_bidder_compliance
from ..schemas import VerificationSummary, VerifyBidderRequest

router = APIRouter(prefix="/api/verification", tags=["Verification"])

@router.post("/run/{bidder_id}", response_model=VerificationSummary)
async def run_bidder_verification(
    bidder_id: int,
    tender_id: Optional[int] = Query(None, description="Optional tender context"),
    request: VerifyBidderRequest = VerifyBidderRequest(),
    db: Session = Depends(get_db)
):
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder {bidder_id} not found")

    tid = tender_id or request.tender_id
    tender = None
    if tid:
        tender = db.query(Tender).filter(Tender.id == tid).first()
        if not tender:
            raise HTTPException(status_code=404, detail=f"Tender {tid} not found")

    result = await evaluate_bidder_compliance(bidder, tender, db)
    return result

@router.post("/run-tender/{tender_id}")
async def run_tender_verifications(tender_id: int, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail=f"Tender {tender_id} not found")
        
    tender_bidders = db.query(TenderBidder).filter(TenderBidder.tender_id == tender_id).all()
    results = []
    
    for tb in tender_bidders:
        bidder = db.query(Bidder).filter(Bidder.id == tb.bidder_id).first()
        if bidder:
            res = await evaluate_bidder_compliance(bidder, tender, db)
            results.append({
                "bidder_id": bidder.id,
                "company_name": bidder.company_name,
                "score": res["overall_score"],
                "risk_level": res["risk_level"]
            })
            
    return {"verified_count": len(results), "tender_id": tender_id, "results": results}

@router.post("/run-all")
async def run_all_verifications(db: Session = Depends(get_db)):
    """Batch verification run across all registered bidders."""
    bidders = db.query(Bidder).all()
    results = []
    for bidder in bidders:
        res = await evaluate_bidder_compliance(bidder, None, db)
        results.append({
            "bidder_id": bidder.id,
            "company_name": bidder.company_name,
            "score": res["overall_score"],
            "risk_level": res["risk_level"]
        })
    return {"verified_count": len(results), "results": results}

@router.post("/reset")
def reset_verification_state(db: Session = Depends(get_db)):
    """Resets all bidders back to unverified PENDING state for demonstration."""
    from ..models.verification import VerificationCheck
    db.query(VerificationCheck).delete()
    bidders = db.query(Bidder).all()
    for b in bidders:
        b.risk_level = "PENDING"
        b.overall_score = None
        b.verification_status = "PENDING"
        b.discrepancy_count = 0
        b.ai_recommendation = None
    tender_bidders = db.query(TenderBidder).all()
    for tb in tender_bidders:
        tb.overall_status = "PENDING"
    db.commit()
    return {"status": "success", "message": "All bidders reset to PENDING verification state."}
