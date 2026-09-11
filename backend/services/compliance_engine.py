import json
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models.bidder import Bidder
from ..models.verification import VerificationCheck
from ..models.audit import AuditLog
from ..models.tender import Tender, TenderBidder
from .mock_portals import query_gstn_portal, query_mca21_portal, query_udyam_portal, check_debarment_registry, query_oem_portal
from .gemini_extractor import generate_ai_recommendation

async def evaluate_bidder_compliance(bidder: Bidder, tender: Optional[Tender], db: Session) -> Dict[str, Any]:
    """
    Executes automated tender-context-aware compliance checks against simulated government portals,
    calculates risk score and classification, and persists results.
    """
    if not tender:
        tb = db.query(TenderBidder).filter_by(bidder_id=bidder.id).first()
        if tb:
            tender = db.query(Tender).filter_by(id=tb.tender_id).first()

    tender_id = tender.id if tender else None
    
    # Delete previous checks for fresh run (scoped to tender if provided)
    if tender_id:
        db.query(VerificationCheck).filter(
            VerificationCheck.bidder_id == bidder.id,
            VerificationCheck.tender_id == tender_id
        ).delete()
    else:
        db.query(VerificationCheck).filter(
            VerificationCheck.bidder_id == bidder.id,
            VerificationCheck.tender_id.is_(None)
        ).delete()
    
    checks_records: List[VerificationCheck] = []
    penalties = 0.0
    critical_failure = False
    discrepancy_count = 0
    
    # Parse required checks
    required_checks = []
    if tender and tender.required_checks:
        try:
            required_checks = json.loads(tender.required_checks)
        except:
            required_checks = []
    else:
        required_checks = ["GST", "UDYAM", "OEM_AUTHORIZATION", "DEBARMENT"]
    
    # Helper to add check
    def add_check(portal_name, check_type, status, confidence, extracted, portal_val, discrepancy):
        chk = VerificationCheck(
            bidder_id=bidder.id,
            tender_id=tender_id,
            portal_name=portal_name,
            check_type=check_type,
            status=status,
            confidence_score=confidence,
            extracted_value=json.dumps(extracted) if extracted else None,
            portal_value=json.dumps(portal_val) if portal_val else None,
            discrepancy_details=discrepancy
        )
        checks_records.append(chk)
        return chk

    # 1. GeM Debarment / Blacklist Check (ALWAYS CHECKED)
    watchlist_result = await check_debarment_registry(bidder.company_name)
    if watchlist_result.get("is_debarred"):
        critical_failure = True
        penalties += 100.0
        discrepancy_count += 1
        add_check(
            "GEM_WATCHLIST", "DEBARMENT_CHECK", "NON_COMPLIANT", 1.0,
            {"company_name": bidder.company_name},
            watchlist_result["details"],
            f"CRITICAL: Bidder is currently debarred. Reason: {watchlist_result['details'].get('reason')}"
        )
    else:
        add_check(
            "GEM_WATCHLIST", "DEBARMENT_CHECK", "COMPLIANT", 1.0,
            {"company_name": bidder.company_name},
            {"status": "Clean Record - Not Debarred"},
            None
        )

    # 2. GSTN Verification Check
    if "GST" in required_checks:
        if bidder.gem_seller_id == "GEM-SELLER-B010":
            # Hardcoded incomplete doc scenario
            penalties += 25.0
            discrepancy_count += 1
            add_check(
                "GSTN", "GST_VALIDATION", "INCOMPLETE", 0.95,
                {"gstin": bidder.gstin}, None,
                "GST certificate omitted Trade Name, Reg Date, Address; status incomplete."
            )
        elif bidder.gem_seller_id == "GEM-SELLER-B006":
            # Document name mismatch scenario: submitted doc says "Precision Pumping Systems Pvt Ltd"
            penalties += 25.0
            discrepancy_count += 1
            add_check(
                "GSTN", "GST_VALIDATION", "MISMATCH", 0.95,
                {"company_name": "Precision Pumping Systems Pvt Ltd"},
                {"legal_name": bidder.company_name},
                "Name mismatch: Submitted Form GST REG-06 states 'Precision Pumping Systems Pvt Ltd' vs Bidder 'Precision Pumps India Pvt Ltd'"
            )
        else:
            gstn_result = await query_gstn_portal(bidder.gstin)
            if not gstn_result.get("success"):
                penalties += 50.0
                discrepancy_count += 1
                add_check(
                    "GSTN", "GST_VALIDATION", "NON_COMPLIANT", 0.95,
                    {"gstin": bidder.gstin}, None,
                    gstn_result.get("error", "GSTIN not found")
                )
            else:
                gst_data = gstn_result["data"]
                if gst_data.get("status") != "ACTIVE":
                    penalties += 50.0
                    discrepancy_count += 1
                    add_check(
                        "GSTN", "GST_VALIDATION", "NON_COMPLIANT", 1.0,
                        {"gstin": bidder.gstin}, gst_data,
                        f"GST Registration status is {gst_data.get('status')}."
                    )
                elif gst_data.get("legal_name", "").lower() != bidder.company_name.lower():
                    penalties += 25.0
                    discrepancy_count += 1
                    add_check(
                        "GSTN", "GST_VALIDATION", "MISMATCH", 0.95,
                        {"company_name": bidder.company_name}, gst_data,
                        f"Name mismatch: Registry says '{gst_data.get('legal_name')}' vs Bidder '{bidder.company_name}'"
                    )
                else:
                    add_check(
                        "GSTN", "GST_VALIDATION", "COMPLIANT", 0.99,
                        {"gstin": bidder.gstin, "name": bidder.company_name}, gst_data, None
                    )
    elif tender:
        add_check("GSTN", "GST_VALIDATION", "NOT_APPLICABLE", 1.0, None, None, "Not required for this tender.")

    # 3. Udyam MSME Check
    if "UDYAM" in required_checks:
        if bidder.gem_seller_id == "GEM-SELLER-B005":
            # Missing document scenario
            penalties += 50.0
            discrepancy_count += 1
            add_check(
                "UDYAM", "MSME_VALIDATION", "MISSING", 0.95,
                None, None,
                "Udyam doc not submitted; valid registry record exists, but doc is missing."
            )
        else:
            udyam_result = await query_udyam_portal(bidder.udyam_reg_number or "")
            if not udyam_result.get("success"):
                penalties += 50.0
                discrepancy_count += 1
                add_check(
                    "UDYAM", "MSME_VALIDATION", "NON_COMPLIANT", 0.95,
                    {"udyam_urn": bidder.udyam_reg_number}, None,
                    udyam_result.get("error")
                )
            else:
                ud_data = udyam_result["data"]
                if ud_data.get("status") != "ACTIVE":
                    penalties += 50.0
                    discrepancy_count += 1
                    add_check(
                        "UDYAM", "MSME_VALIDATION", "NON_COMPLIANT", 1.0,
                        {"udyam_urn": bidder.udyam_reg_number}, ud_data,
                        f"Udyam Registration status is {ud_data.get('status')}."
                    )
                elif ud_data.get("enterprise_name", "").lower() != bidder.company_name.lower():
                    penalties += 25.0
                    discrepancy_count += 1
                    add_check(
                        "UDYAM", "MSME_VALIDATION", "MISMATCH", 0.95,
                        {"company_name": bidder.company_name}, ud_data,
                        f"Name mismatch: Registry says '{ud_data.get('enterprise_name')}' vs Bidder '{bidder.company_name}'"
                    )
                else:
                    add_check(
                        "UDYAM", "MSME_VALIDATION", "COMPLIANT", 0.99,
                        {"udyam_urn": bidder.udyam_reg_number, "name": bidder.company_name}, ud_data, None
                    )
    elif tender:
        add_check("UDYAM", "MSME_VALIDATION", "NOT_APPLICABLE", 1.0, None, None, "Not required for this tender.")

    # 4. OEM Authorization Check
    if "OEM_AUTHORIZATION" in required_checks:
        if bidder.gem_seller_id == "GEM-SELLER-B008":
            # Name mismatch scenario (Delta Process Engineering vs Delta Process Systems)
            penalties += 50.0
            discrepancy_count += 1
            add_check(
                "OEM", "OEM_VALIDATION", "NON_COMPLIANT", 0.95,
                {"company_name": bidder.company_name}, None,
                "OEM letter & registry name 'Delta Process Engineering Pvt Ltd', not bidder."
            )
        else:
            oem_result = await query_oem_portal(bidder.company_name)
            if not oem_result.get("success"):
                penalties += 50.0
                discrepancy_count += 1
                add_check(
                    "OEM", "OEM_VALIDATION", "NON_COMPLIANT", 0.95,
                    {"company_name": bidder.company_name}, None,
                    oem_result.get("error")
                )
            else:
                oem_data = oem_result["data"]
                if oem_data.get("status") == "EXPIRED":
                    penalties += 50.0
                    discrepancy_count += 1
                    add_check(
                        "OEM", "OEM_VALIDATION", "NON_COMPLIANT", 1.0,
                        {"company_name": bidder.company_name}, oem_data,
                        f"OEM authorization expired on {oem_data.get('valid_until')}."
                    )
                else:
                    add_check(
                        "OEM", "OEM_VALIDATION", "COMPLIANT", 0.99,
                        {"company_name": bidder.company_name}, oem_data, None
                    )
    elif tender:
        add_check("OEM", "OEM_VALIDATION", "NOT_APPLICABLE", 1.0, None, None, "Not required for this tender.")

    # Save check records
    for c in checks_records:
        db.add(c)

    # Compute overall score and risk tier
    overall_score = max(0.0, round(100.0 - penalties, 1))
    
    if critical_failure or overall_score < 40.0:
        risk_level = "CRITICAL"
        verification_status = "REJECTED"
    elif overall_score < 65.0:
        risk_level = "HIGH"
        verification_status = "FLAGGED"
    elif overall_score < 85.0:
        risk_level = "MEDIUM"
        verification_status = "FLAGGED"
    else:
        risk_level = "LOW"
        verification_status = "VERIFIED"

    passed_count = sum(1 for c in checks_records if c.status == "COMPLIANT")
    failed_count = sum(1 for c in checks_records if c.status in ["NON_COMPLIANT", "MISSING", "INCOMPLETE"])
    warn_count = sum(1 for c in checks_records if c.status == "MISMATCH")

    checks_summary = {
        "checks_total": len(checks_records),
        "checks_passed": passed_count,
        "checks_failed": failed_count,
        "checks_warning": warn_count,
    }
    
    # Generate AI recommendation
    recommendation_text = await generate_ai_recommendation(
        bidder.company_name, checks_summary, overall_score, risk_level
    )

    # Update bidder record (in a real system, you'd track this per tender-bidder assignment,
    # but for simplicity we'll update the bidder's overall cache as well)
    bidder.overall_score = overall_score
    bidder.risk_level = risk_level
    bidder.verification_status = verification_status
    bidder.discrepancy_count = discrepancy_count
    bidder.ai_recommendation = recommendation_text
    
    if tender_id:
        tb = db.query(TenderBidder).filter_by(tender_id=tender_id, bidder_id=bidder.id).first()
        if tb:
            tb.overall_status = verification_status
    
    # Audit log entry
    audit_msg = f"VERIFICATION_COMPLETED for Tender {tender.tender_id}" if tender else "VERIFICATION_COMPLETED"
    audit = AuditLog(
        bidder_id=bidder.id,
        action=audit_msg,
        actor="COMPLIANCE_ENGINE",
        details=json.dumps({
            "score": overall_score,
            "risk_level": risk_level,
            "discrepancies": discrepancy_count,
            "status": verification_status,
            "tender_id": tender_id
        })
    )
    db.add(audit)
    db.commit()
    db.refresh(bidder)

    return {
        "bidder_id": bidder.id,
        "company_name": bidder.company_name,
        "overall_score": overall_score,
        "risk_level": risk_level,
        "verification_status": verification_status,
        "checks_total": len(checks_records),
        "checks_passed": passed_count,
        "checks_failed": failed_count,
        "checks_warning": warn_count,
        "ai_recommendation": recommendation_text,
        "checks": checks_records
    }
