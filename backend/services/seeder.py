import json
from sqlalchemy.orm import Session
from ..models.bidder import Bidder
from ..models.verification import VerificationCheck
from ..models.audit import AuditLog
from ..models.tender import Tender, TenderBidder

INITIAL_BIDDERS = [
    {
        "company_name": "Bharat Industrial Systems Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B001",
        "gstin": "99AA01B1234C1Z1",
        "pan": "AA01B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000001",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Eastern Process Equipment Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B002",
        "gstin": "99AA02B1234C1Z2",
        "pan": "AA02B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000002",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Apex Flow Technologies Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B003",
        "gstin": "99AA03B1234C1Z3",
        "pan": "AA03B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000003",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Nova Engineering Solutions Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B004",
        "gstin": "99AA04B1234C1Z4",
        "pan": "AA04B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000004",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Shakti Mechanical Works",
        "gem_seller_id": "GEM-SELLER-B005",
        "gstin": "99AA05B1234C1Z5",
        "pan": "AA05B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000005",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Precision Pumps India Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B006",
        "gstin": "99AA06B1234C1Z6",
        "pan": "AA06B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000006",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Assam Industrial Products Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B007",
        "gstin": "99AA07B1234C1Z7",
        "pan": "AA07B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000007",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Delta Process Systems Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B008",
        "gstin": "99AA08B1234C1Z8",
        "pan": "AA08B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000008",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "Meridian Engineering Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B009",
        "gstin": "99AA09B1234C1Z9",
        "pan": "AA09B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000009",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    },
    {
        "company_name": "National Process Equipment Pvt Ltd",
        "gem_seller_id": "GEM-SELLER-B010",
        "gstin": "99AA10B1234C1Z0",
        "pan": "AA10B1234C",
        "udyam_reg_number": "UDYAM-XX-00-000010",
        "risk_level": "PENDING",
        "overall_score": None,
        "verification_status": "PENDING"
    }
]

INITIAL_TENDERS = [
    {
        "tender_id": "2026_EIL_909232_1",
        "tender_title": "SP/ B957-000-YB-MR-1380/162 TANK PR. PROTECT. DEVICES / FLAME ARRSTR FOR BINA PETCHEM AND REFINERY EXPANSION PROJECT (BPREP)",
        "organisation": "Engineers India Limited",
        "required_checks": json.dumps(["OEM_AUTHORIZATION", "DEBARMENT"])
    },
    {
        "tender_id": "2026_EIL_915736_1",
        "tender_title": "SS/C050-1P39A-PA-MR-5100/50 - PUMP-RECIPRO(API 675,PLUNGER/DIAPHRAGM) FOR POLYPROPYLENE PROJECT OF M/S NUMALIGARH REFINERY LIMITED",
        "organisation": "Engineers India Limited",
        "required_checks": json.dumps(["UDYAM", "DEBARMENT"])
    },
    {
        "tender_id": "2026_EIL_912228_1",
        "tender_title": "JP/ B862-000-MF-MR-8002/109 - WATER CUM FOAM MONITOR, REMOTE CONTROLLED FIRE WATER CUM FOAM MONITOR, DELUGE VALVE (Diaphragm Type) FOR PLL.",
        "organisation": "Engineers India Limited",
        "required_checks": json.dumps(["GST", "DEBARMENT"])
    }
]

TENDER_ASSIGNMENTS = {
    "2026_EIL_909232_1": ["GEM-SELLER-B001", "GEM-SELLER-B003", "GEM-SELLER-B008"],
    "2026_EIL_915736_1": ["GEM-SELLER-B002", "GEM-SELLER-B005", "GEM-SELLER-B007", "GEM-SELLER-B009"],
    "2026_EIL_912228_1": ["GEM-SELLER-B004", "GEM-SELLER-B006", "GEM-SELLER-B010"]
}

def seed_database(db: Session):
    """Seed initial sample bidders and tenders if database is empty."""
    existing_count = db.query(Bidder).count()
    if existing_count > 0:
        return

    print("[GeMStones] Seeding initial realistic bidder datasets...")
    
    # Store bidder objects by seller ID for easy mapping
    bidder_map = {}
    for data in INITIAL_BIDDERS:
        bidder = Bidder(**data)
        db.add(bidder)
        db.flush()
        bidder_map[data["gem_seller_id"]] = bidder

        audit = AuditLog(
            bidder_id=bidder.id,
            action="BIDDER_REGISTERED",
            actor="SYSTEM_SEEDER",
            details=json.dumps({"source": "GeM Bidder Onboarding Feed"})
        )
        db.add(audit)
    
    for tender_data in INITIAL_TENDERS:
        tender = Tender(**tender_data)
        db.add(tender)
        db.flush()
        
        assigned_sellers = TENDER_ASSIGNMENTS.get(tender.tender_id, [])
        for seller_id in assigned_sellers:
            if seller_id in bidder_map:
                tb = TenderBidder(
                    tender_id=tender.id,
                    bidder_id=bidder_map[seller_id].id,
                    overall_status="PENDING"
                )
                db.add(tb)

    db.commit()
    print("[GeMStones] Database seeded successfully with 10 dataset bidders and 3 tenders.")
