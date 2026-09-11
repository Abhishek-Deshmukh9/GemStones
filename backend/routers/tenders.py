from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.tender import Tender, TenderBidder
from ..models.bidder import Bidder
from ..schemas import TenderResponse, TenderBidderResponse

router = APIRouter(prefix="/api/tenders", tags=["Tenders"])

@router.get("", response_model=List[TenderResponse])
def get_tenders(db: Session = Depends(get_db)):
    tenders = db.query(Tender).all()
    return tenders

@router.get("/{tender_id}", response_model=TenderResponse)
def get_tender_detail(tender_id: int, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail=f"Tender with ID {tender_id} not found")
    return tender

@router.post("/{tender_id}/assign/{bidder_id}", response_model=TenderBidderResponse)
def assign_bidder_to_tender(tender_id: int, bidder_id: int, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")
        
    existing = db.query(TenderBidder).filter(
        TenderBidder.tender_id == tender_id,
        TenderBidder.bidder_id == bidder_id
    ).first()
    
    if existing:
        return existing
        
    tb = TenderBidder(
        tender_id=tender_id,
        bidder_id=bidder_id,
        overall_status="PENDING"
    )
    db.add(tb)
    db.commit()
    db.refresh(tb)
    
    return tb
