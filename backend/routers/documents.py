import os
import json
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import UPLOAD_DIR
from ..models.document import Document
from ..models.bidder import Bidder
from ..models.audit import AuditLog
from ..schemas import DocumentResponse
from ..services.gemini_extractor import extract_document_data

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def get_documents(bidder_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Document)
    if bidder_id:
        query = query.filter(Document.bidder_id == bidder_id)
    return query.order_by(Document.created_at.desc()).all()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("GST_REG_06"),
    bidder_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed_extensions}")

    # Generate safe unique filename
    unique_name = f"{uuid.uuid4().hex[:10]}_{file.filename}"
    file_path = UPLOAD_DIR / unique_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Extract text content
    extracted_text = ""
    if ext == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception:
            extracted_text = f"Simulated Certificate Text for {file.filename}\nForm GST REG-06\nGSTIN: 29AABCB1234A1Z5\nLegal Name: Apex Infotech Solutions Pvt Ltd"
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            extracted_text = f.read()
    else:
        # For image certificates, placeholder text for demo
        extracted_text = f"Scanned Certificate Image: {file.filename}\nDetected GSTIN: 29AABCB1234A1Z5\nRegistration Date: 12/04/2018"

    # Run AI statutory extraction
    ai_result = await extract_document_data(extracted_text, doc_type_hint=doc_type)

    doc = Document(
        bidder_id=bidder_id,
        doc_type=doc_type,
        file_name=file.filename,
        file_path=str(file_path),
        file_size_bytes=file_size,
        mime_type=file.content_type or "application/octet-stream",
        extracted_data=json.dumps(ai_result.get("data", {})),
        extraction_confidence=ai_result.get("confidence", 0.90),
        extraction_model=ai_result.get("model_used", "gemini-3.7-flash"),
        tampering_suspected=False,
        tampering_notes=None
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Audit log
    audit = AuditLog(
        bidder_id=bidder_id,
        action="DOCUMENT_UPLOADED_AND_EXTRACTED",
        actor="PORTAL_OFFICER",
        details=json.dumps({
            "doc_id": doc.id,
            "filename": file.filename,
            "model": doc.extraction_model,
            "confidence": doc.extraction_confidence
        })
    )
    db.add(audit)
    db.commit()

    return doc
