from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.audit import AuditLog
from ..schemas import AuditLogResponse

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    bidder_id: Optional[int] = Query(None, description="Filter logs for a specific bidder"),
    limit: int = Query(50, description="Max logs to return"),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if bidder_id:
        query = query.filter(AuditLog.bidder_id == bidder_id)
    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
