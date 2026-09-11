# 🏛️ GeMStones: Exhaustive Technical Implementation & Architecture Context Guide

> **Definitive Agent & Developer Context Document**: This document is the single-source-of-truth technical blueprint for the **GeMStones** platform (AI-Powered Integrated Bid Compliance & Seller Verification Platform for GeM Procurement). It contains complete code-level specifications, database schemas, scoring formulas, AI/LLM integration details, mock registry implementations, API contracts, and frontend design system tokens. Any AI agent or engineer can read this document to understand the entire codebase without needing to read dozens of individual files.

---

## 1. System Architecture & Engineering Principles

### High-Level Architecture
GeMStones is implemented as an integrated, high-performance, standalone web application designed for zero-configuration local execution during demonstrations and evaluations.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (React 19 / Vite)                            │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Navigation Controller: App.jsx (Tab-based view coordination, zero-router overhead) │  │
│  │ ├─ DashboardView.jsx   : Executive compliance KPIs, Recharts, batch triggers, reset │  │
│  │ ├─ TendersView.jsx     : Tender scope selection, bidder counts, status indicators │  │
│  │ ├─ BiddersView.jsx     : Filter tabs, SVG Compliance Gauge, portal checks, decision │  │
│  │ ├─ UploadView.jsx      : PDF certificate upload, OCR, statutory extraction viewer   │  │
│  │ └─ AuditView.jsx       : Chronological statutory audit timeline ledger             │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│         │ JSON API Requests (/api/* proxied via vite.config.js to port 8000)            │
└─────────┼───────────────────────────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND (FastAPI / Python 3.12+)                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Routers: /api/tenders, /api/bidders, /api/verification, /api/documents, /api/audit  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│         │                                        │                                      │
│  ┌──────▼───────────────────────────┐     ┌──────▼───────────────────────────────────┐  │
│  │ Compliance Engine                │     │ AI / LLM Pipeline (gemini_extractor.py)  │  │
│  │ ├─ Tender-Context-Aware Checks   │     │ ├─ Model: gemini-3.5-flash-lite          │  │
│  │ ├─ Penalty Scoring (0-100)       │     │ ├─ Live Document & Recommendation Gen    │  │
│  │ └─ Risk Classification Engine    │     │ └─ Deterministic RuleEngine-Regex-v1 FB  │  │
│  └──────┬───────────────────────────┘     └──────────────────────────────────────────┘  │
│         │                                                                               │
│  ┌──────▼───────────────────────────┐     ┌──────────────────────────────────────────┐  │
│  │ Mock Portals (mock_portals.py)   │     │ Database Layer (SQLite / SQLAlchemy ORM) │  │
│  │ ├─ gst_registry.csv (GSTN)       │     │ File: backend/gemstones.db               │  │
│  │ ├─ udyam_registry.csv (MSME)     │     │ Models: Bidder, Tender, TenderBidder,    │  │
│  │ ├─ oem_registry.csv (OEM)        │     │         VerificationCheck, Document,     │  │
│  │ └─ debarment_registry.csv (CPPP) │     │         AuditLog                         │  │
│  └──────────────────────────────────┘     └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Engineering Constraints
1. **Vanilla CSS Only**: No TailwindCSS, no Bootstrap, no Material-UI. All styling is implemented using native CSS custom properties and modular CSS files.
2. **Professional Government Light Theme**:
   - Primary Background: Light Slate (`#f8fafc`).
   - Card Surfaces: Solid White (`#ffffff`), subtle borders (`#e2e8f0`), zero glassmorphism / blur filters.
   - Primary Accent: Deep Government Navy (`#1e3a5f`).
   - National Identity: Official Indian Tricolor header accent stripe (Saffron `#FF9933`, White `#FFFFFF`, Green `#138808`).
   - Typography: Inter for UI body and headings; JetBrains Mono strictly for government alphanumeric codes (GSTIN, PAN, CIN, URN).
3. **Zero-Downtime Graceful Degradation**:
   - The platform functions completely offline without internet or API keys using realistic mock registries and deterministic statutory regex extractors.
   - When configured with `GEMINI_API_KEY`, it leverages Google Gemini 3.5 Flash Lite (`gemini-3.5-flash-lite`).

---

## 2. Directory Tree & Module Map

```
GemStones/
├── backend/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app entrypoint, CORS setup, router mounting, DB initialization
│   ├── config.py                    # Environment configuration via python-dotenv (override=True)
│   ├── database.py                  # SQLite engine, scoped SessionLocal, Base declarative model
│   ├── schemas.py                   # Pydantic v2 validation models for all API request/response payloads
│   ├── requirements.txt             # Python dependencies (FastAPI, SQLAlchemy, uvicorn, google-genai, etc.)
│   ├── generate_samples.py          # ReportLab script for synthetic authentic PDF certificates
│   ├── models/
│   │   ├── __init__.py              # Re-exports all SQLAlchemy models
│   │   ├── bidder.py                # Bidder master entity model
│   │   ├── tender.py                # Tender entity and TenderBidder association models
│   │   ├── verification.py          # VerificationCheck model for individual statutory portal checks
│   │   ├── document.py              # Document upload and extraction metadata model
│   │   └── audit.py                 # AuditLog immutable ledger model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── compliance_engine.py     # Tender-context-aware multi-portal evaluation & penalty scoring engine
│   │   ├── gemini_extractor.py      # Gemini 3.5 Flash Lite extractor + RuleEngine-Regex-v1 fallback
│   │   ├── mock_portals.py          # CSV-backed simulated GSTN, MCA21, MSME Udyam, Debarment & OEM portals
│   │   └── seeder.py                # Initial database seed script (10 ground-truth bidders, 3 EIL tenders)
│   └── routers/
│       ├── __init__.py
│       ├── bidders.py               # Bidder CRUD, summary statistics, officer decision submissions
│       ├── tenders.py               # Tender listing, detail, and bidder assignment endpoints
│       ├── verification.py          # Single-bidder, batch tender, batch global verification, and demo reset
│       ├── documents.py             # Multipart PDF upload and automated AI statutory extraction
│       └── audit.py                 # Audit trail inspection endpoint
│
├── frontend/
│   ├── index.html                   # HTML5 root with Inter and JetBrains Mono Google Fonts
│   ├── vite.config.js               # Vite bundler config with /api proxy to http://127.0.0.1:8000
│   ├── package.json                 # React 19, Lucide-React, Recharts, Vite dependencies
│   └── src/
│       ├── main.jsx                 # React root mounting
│       ├── App.jsx                  # Master tab navigation coordinator and view state holder
│       ├── App.css                  # Global micro-animations and keyframes
│       ├── index.css                # Global CSS design system, color tokens, button styles, badges, chips
│       ├── utils/
│       │   └── api.js               # Centralized fetch wrapper for backend endpoints
│       └── components/
│           ├── Layout/
│           │   ├── Header.jsx       # Top app header with dynamic titles and Nodal Officer desk badge
│           │   ├── Sidebar.jsx      # Deep Navy sidebar navigation with active tab indicators & tricolor badge
│           │   └── Layout.css       # Layout grid, sidebar, header, and officer badge styling
│           ├── Dashboard/
│           │   ├── DashboardView.jsx# Executive compliance metrics, count-up animation, Recharts, batch run
│           │   └── Dashboard.css    # Stats cards, charts grid, banner-glass, and quick-table styling
│           ├── Bidders/
│           │   └── BiddersView.jsx  # Master-detail bidder registry, filter tabs, SVG gauge, decision console
│           ├── Tenders/
│           │   └── TendersView.jsx  # Active procurement tenders, required check chips, bidder counts
│           ├── Upload/
│           │   └── UploadView.jsx   # Drag-and-drop statutory certificate upload & AI field inspector
│           └── Audit/
│               └── AuditView.jsx    # Chronological nodal officer audit trail
│
├── DATASET/
│   ├── 01_TENDER/                   # Reference tender JSONs from Engineers India Limited
│   ├── 03_BIDDER_DOCUMENTS/         # Raw bidder text extracts and certificates
│   ├── 05_MOCK_REGISTRIES/          # Official ground-truth registry CSV files
│   │   ├── gst_registry.csv         # Simulated GSTN database (GSTIN, legal name, status, dates)
│   │   ├── udyam_registry.csv       # Simulated MSME database (URN, enterprise name, status)
│   │   ├── oem_registry.csv         # Simulated OEM authorization database (manufacturer, authorized reseller)
│   │   └── debarment_registry_synthetic.csv # CPPP / GeM blacklisted vendor watchlist
│   └── 06_GROUND_TRUTH/
│       └── compliance_labels.csv    # Official benchmark mapping expected compliance results for all 10 bidders
│
├── docs/
│   ├── APPLICATION_GUIDE.md         # Non-technical handbook for teammates, judges, and procurement officers
│   ├── PROJECT_IMPLEMENTATION_SUMMARY.md # This file (exhaustive technical context for agents & engineers)
│   ├── SCHEMA.md                    # Database & payload schema reference
│   ├── DATASET_ANALYSIS.md          # EIL tender dataset breakdown
│   ├── TEAM_SETUP_GUIDE.md          # Team collaboration guide
│   ├── PS.txt                       # Official SIH 2026 Problem Statement
│   ├── UI_REFERENCE_DASHBOARD.jpg   # UI reference mockup (Dashboard)
│   └── UI_REFERENCE_BIDDER_DETAIL.jpg# UI reference mockup (Bidder detail)
├── AGENTS.md                        # Antigravity IDE agent conventions
├── README.md                        # Quickstart and project overview
└── gemstones.db                     # SQLite database file generated at runtime
```

---

## 3. Database Models & Schema Specifications

Defined using SQLAlchemy ORM in `backend/models/`. All foreign keys have cascade deletion configured.

### `bidders` Table (`backend/models/bidder.py`)
Master table storing vendor statutory credentials and cached evaluation metrics.
```python
class Bidder(Base):
    __tablename__ = "bidders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(255), nullable=False, index=True)
    trade_name = Column(String(255), nullable=True)
    gem_seller_id = Column(String(64), unique=True, nullable=False, index=True) # e.g. "GEM-SELLER-B001"
    
    # Government Statutory Identifiers
    gstin = Column(String(15), unique=True, nullable=False, index=True)         # 15-character GSTIN
    pan = Column(String(10), nullable=False, index=True)                        # 10-character PAN
    cin = Column(String(21), nullable=True, index=True)                         # 21-character MCA CIN
    udyam_reg_number = Column(String(19), nullable=True, index=True)            # UDYAM-XX-00-0000000
    msme_category = Column(String(32), nullable=True)                           # Micro, Small, Medium
    epfo_code = Column(String(32), nullable=True)
    esic_number = Column(String(17), nullable=True)
    
    # Address and Jurisdiction
    registered_address = Column(Text, nullable=True)
    state_code = Column(String(2), nullable=True)                              # e.g. "99", "07", "27"
    
    # Compliance Evaluation State
    risk_level = Column(String(16), default="PENDING")                         # PENDING, LOW, MEDIUM, HIGH, CRITICAL
    overall_score = Column(Float, nullable=True, default=None)                 # 0.0 to 100.0, None if unverified
    verification_status = Column(String(32), default="PENDING")                # PENDING, VERIFIED, FLAGGED, REJECTED
    discrepancy_count = Column(Integer, default=0)
    ai_recommendation = Column(Text, nullable=True)                            # Gemini-generated officer recommendation
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    verification_checks = relationship("VerificationCheck", back_populates="bidder", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="bidder", cascade="all, delete-orphan")
    tender_assignments = relationship("TenderBidder", back_populates="bidder", cascade="all, delete-orphan")
```

### `tenders` Table (`backend/models/tender.py`)
Stores procurement notices and their specific statutory evaluation rules.
```python
class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tender_id = Column(String(64), unique=True, nullable=False, index=True)    # e.g. "2026_EIL_909232_1"
    tender_title = Column(String(500), nullable=False)
    organisation = Column(String(255), nullable=True)                          # e.g. "Engineers India Limited"
    ministry_department = Column(String(255), nullable=True)
    tender_category = Column(String(64), default="Goods")
    published_date = Column(DateTime, nullable=True)
    closing_date = Column(DateTime, nullable=True)
    emd = Column(Float, default=0.0)                                           # Earnest Money Deposit
    required_checks = Column(Text, nullable=True)                              # JSON Array: ["OEM_AUTHORIZATION", "DEBARMENT"]
    tender_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    tender_bidders = relationship("TenderBidder", back_populates="tender", cascade="all, delete-orphan")
    verification_checks = relationship("VerificationCheck", back_populates="tender", cascade="all, delete-orphan")
```

### `tender_bidders` Table (`backend/models/tender.py`)
Association table linking bidders to tenders with procurement-stage statuses.
```python
class TenderBidder(Base):
    __tablename__ = "tender_bidders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tender_id = Column(Integer, ForeignKey("tenders.id", ondelete="CASCADE"), nullable=False)
    bidder_id = Column(Integer, ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    overall_status = Column(String(32), default="PENDING")                     # PENDING, VERIFIED, FLAGGED, REJECTED
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    tender = relationship("Tender", back_populates="tender_bidders")
    bidder = relationship("Bidder", back_populates="tender_assignments")
```

### `verification_checks` Table (`backend/models/verification.py`)
Individual statutory check records generated per portal during verification.
```python
class VerificationCheck(Base):
    __tablename__ = "verification_checks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id", ondelete="CASCADE"), nullable=False)
    tender_id = Column(Integer, ForeignKey("tenders.id", ondelete="CASCADE"), nullable=True)
    portal_name = Column(String(64), nullable=False)                           # GSTN, MCA21, UDYAM, GEM_WATCHLIST, OEM
    check_type = Column(String(64), nullable=False)                            # GST_VALIDATION, DEBARMENT_CHECK, etc.
    status = Column(String(32), nullable=False)                                # COMPLIANT, MISMATCH, NON_COMPLIANT, MISSING, NOT_APPLICABLE
    confidence_score = Column(Float, default=1.0)
    extracted_value = Column(Text, nullable=True)                              # JSON payload of bidder-declared data
    portal_value = Column(Text, nullable=True)                                 # JSON payload of registry-returned data
    discrepancy_details = Column(Text, nullable=True)                          # Human-readable discrepancy explanation
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    bidder = relationship("Bidder", back_populates="verification_checks")
    tender = relationship("Tender", back_populates="verification_checks")
```

### `documents` Table (`backend/models/document.py`)
Stores uploaded PDF certificates and their parsed statutory fields.
```python
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id", ondelete="CASCADE"), nullable=True)
    doc_type = Column(String(64), nullable=False)                              # GST_REG_06, UDYAM_CERT, MCA_COI, PAN_CARD
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    extracted_data = Column(Text, nullable=True)                               # JSON of parsed statutory fields
    extraction_model = Column(String(64), default="gemini-3.5-flash-lite")
    confidence_score = Column(Float, default=0.95)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    bidder = relationship("Bidder", back_populates="documents")
```

### `audit_logs` Table (`backend/models/audit.py`)
Immutable append-only ledger tracking all actions taken by officers or the engine.
```python
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bidder_id = Column(Integer, ForeignKey("bidders.id", ondelete="CASCADE"), nullable=True)
    action = Column(String(64), nullable=False)                                # VERIFICATION_COMPLETED, OFFICER_DECISION, etc.
    actor = Column(String(128), default="COMPLIANCE_ENGINE")
    details = Column(Text, nullable=True)                                      # JSON details of action
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    bidder = relationship("Bidder")
```

---

## 4. The Statutory Compliance & Scoring Engine

Located in `backend/services/compliance_engine.py`.

### Mathematical Scoring Formula
```python
overall_score = max(0.0, round(100.0 - penalties, 1))
```

### Statutory Penalty Matrix
| Discrepancy Type | Penalty Deducted | Triggering Condition | Resulting Status |
| :--- | :---: | :--- | :---: |
| **Debarment / Blacklist** | **-100.0 pts** | Bidder appears on Central Debarment Watchlist (GFR Rule 151) | `REJECTED` / `CRITICAL` |
| **Invalid Statutory ID** | **-50.0 pts** | Registry reports GSTIN or URN status as `INVALID` or not found | `FLAGGED` / `HIGH` |
| **Expired Certificate** | **-50.0 pts** | OEM reseller authorization past validity date | `FLAGGED` / `HIGH` |
| **Missing Mandatory Document** | **-50.0 pts** | Registry record exists but mandatory tender certificate omitted | `FLAGGED` / `HIGH` |
| **Entity Name Mismatch** | **-25.0 pts** | Legal name on certificate differs from bidding entity | `FLAGGED` / `MEDIUM` |
| **Incomplete Certificate** | **-25.0 pts** | Form GST REG-06 omits Trade Name, Date, or Registered Office | `FLAGGED` / `MEDIUM` |
| **Clean Statutory Record** | **0.0 pts** | Active registration, unexpired credentials, zero discrepancies | `VERIFIED` / `LOW` |

### Risk Tier Thresholds
```python
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
```

### Tender-Context-Aware Resolution Algorithm
When `evaluate_bidder_compliance(bidder, tender, db)` executes:
1. **Tender Lookup**: If `tender` parameter is `None` (e.g. called from global `/api/verification/run-all`), the engine automatically queries `TenderBidder` to resolve the bidder's assigned tender:
   ```python
   if not tender:
       tb = db.query(TenderBidder).filter_by(bidder_id=bidder.id).first()
       if tb:
           tender = db.query(Tender).filter_by(id=tb.tender_id).first()
   ```
2. **Rulebook Scoping**:
   - If a tender is assigned, `required_checks = json.loads(tender.required_checks)`.
   - If no tender is assigned anywhere, defaults to all standard checks: `["GST", "UDYAM", "OEM_AUTHORIZATION", "DEBARMENT"]`.
3. **Mandatory Overrides**:
   - `DEBARMENT` check is **unconditionally run for all bidders** regardless of tender configuration, ensuring blacklisted vendors cannot bypass screening.
4. **Non-Applicable Checks**:
   - Any check omitted from `required_checks` (e.g. UDYAM on an OEM-only tender) is assigned status `NOT_APPLICABLE` with 0 penalty:
     ```python
     add_check("UDYAM", "MSME_VALIDATION", "NOT_APPLICABLE", 1.0, None, None, "Not required for this tender.")
     ```
5. **AI Recommendation Generation**: Calls `generate_ai_recommendation(company_name, checks_summary, overall_score, risk_level)`.
6. **Persistence**: Deletes old checks for the scope, inserts fresh `VerificationCheck` records, updates `Bidder` record, updates `TenderBidder.overall_status`, writes an `AuditLog` entry, and commits the transaction.

---

## 5. AI / LLM Pipeline (`backend/services/gemini_extractor.py`)

### Model Selection
- Configured model: **`gemini-3.5-flash-lite`** via the `google-genai` SDK (`v1beta`).
- **Rationale**: Benchmarked for maximum throughput and resilience on Google AI Studio API tiers. Tested with rapid concurrent batch calls with 0 quota exhaustion (`429`) or server unavailable (`503`) errors.

### Document Statutory Data Extraction (`extract_document_data`)
Accepts raw extracted text from uploaded PDF certificates and prompts Gemini to extract structured JSON conforming to the statutory schema:
```json
{
  "doc_type": "GST_REG_06 | UDYAM_CERT | MCA_COI | PAN_CARD | OTHER",
  "gstin": "string or null",
  "pan": "string or null",
  "cin": "string or null",
  "udyam_reg_number": "string or null",
  "legal_name": "string or null",
  "trade_name": "string or null",
  "registered_address": "string or null",
  "date_of_registration": "string or null",
  "constitution_of_business": "string or null",
  "tampering_indicators": "string or null",
  "confidence_score": 0.95
}
```

### Officer Recommendation Generation (`generate_ai_recommendation`)
Accepts the bidder's company name, statutory checks summary, calculated score, and risk tier. Synthesizes a formal 3-4 sentence evaluation recommendation for the Nodal Officer:
> *"Bharat Industrial Systems Pvt Ltd has achieved a flawless compliance score of 100.0 out of 100 with a low risk level, successfully passing all statutory verification checks without any warnings or failures. The bidder has fully satisfied all technical, financial, and legal criteria stipulated under the applicable Government of India procurement guidelines. In light of these verified credentials and optimal risk assessment, it is recommended to approve the bidder for the current procurement process."*

### Zero-Downtime Deterministic Fallback (`RuleEngine-Regex-v1`)
If `GEMINI_API_KEY` is not provided, or if an API exception occurs (rate limit, high demand spike, network drop), the system catches the exception and immediately invokes `fallback_regex_extractor(text)`.
- Uses official Indian statutory regular expressions:
  - **GSTIN**: `\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b`
  - **PAN**: `\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b`
  - **CIN**: `\b[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}\b`
  - **UDYAM**: `\bUDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}\b`
  - **Date**: `\b(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.](19|20)\d\d\b`
- Emits structured fallback recommendations without breaking the UI.

---

## 6. Simulated Government Registries (`backend/services/mock_portals.py`)

External government databases are simulated using authentic CSV datasets stored in `DATASET/05_MOCK_REGISTRIES/`. Each function introduces simulated network latency (`asyncio.sleep(random.uniform(0.4, 0.8))`) to realistically emulate external portal response times.

1. **GSTN Portal Simulator (`query_gstn_portal`)**:
   - Source: `DATASET/05_MOCK_REGISTRIES/gst_registry.csv`
   - Fields: `gstin, legal_name, status, registration_date, cancellation_date, source`
   - Verifies if GSTIN is registered, whether status is `ACTIVE` or `INVALID`, and matches legal entity names.
2. **MSME Udyam Portal Simulator (`query_udyam_portal`)**:
   - Source: `DATASET/05_MOCK_REGISTRIES/udyam_registry.csv`
   - Fields: `udyam_reg_number, enterprise_name, major_activity, enterprise_type, status, date_of_incorporation, date_of_udyam`
   - Validates URN, enterprise categorization (Micro/Small/Medium), and active status.
3. **OEM Authorization Database (`query_oem_portal`)**:
   - Source: `DATASET/05_MOCK_REGISTRIES/oem_registry.csv`
   - Fields: `authorization_code, oem_name, authorized_bidder_name, product_category, validity_start, validity_end, status`
   - Detects expired authorization letters (`EXPIRED`) and reseller entity mismatches.
4. **GeM Central Debarment Watchlist (`check_debarment_registry`)**:
   - Source: `DATASET/05_MOCK_REGISTRIES/debarment_registry_synthetic.csv`
   - Fields: `debarment_id, company_name, gstin, debarment_reason, debarred_by, order_number, effective_from, effective_to, status`
   - Detects blacklisted/debarred entities banned under GFR Rule 151.

---

## 7. Complete API Contracts & Route Map

All routes are prefixed with `/api` and defined across modular FastAPI routers mounted in `backend/main.py`.

### Bidders Router (`/api/bidders`)
| Method | Endpoint | Query / Body Params | Response Shape | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/bidders` | `search`, `risk_level`, `status` | `List[BidderResponse]` | List all registered bidders with optional filters |
| `GET` | `/api/bidders/stats/summary` | None | `{ total_bidders, avg_compliance_score, pending_count, risk_breakdown, status_breakdown }` | Executive KPI stats for Dashboard cards |
| `GET` | `/api/bidders/{id}` | None | `{ bidder: BidderResponse, checks: List[VerificationCheckResponse], documents: List, audit_logs: List }` | Comprehensive bidder profile with portal check evidence |
| `POST` | `/api/bidders/{id}/decision` | `OfficerDecisionRequest: { decision, notes, officer_name }` | `{ status, bidder_id, new_status, decision }` | Records binding administrative decision (Approved, Flagged, Rejected) |

### Tenders Router (`/api/tenders`)
| Method | Endpoint | Query / Body Params | Response Shape | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tenders` | None | `List[TenderResponse]` | Returns all active procurement tenders with enrolled bidder lists |
| `GET` | `/api/tenders/{id}` | None | `TenderResponse` | Returns tender details and enrolled bidders (`tender_bidders`) |
| `POST` | `/api/tenders/{id}/assign/{bidder_id}` | None | `TenderBidderResponse` | Enrolls a bidder into a tender |

### Verification Router (`/api/verification`)
| Method | Endpoint | Query / Body Params | Response Shape | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/verification/run/{bidder_id}` | `tender_id` (Query/Body) | `VerificationSummary` | Runs statutory audit for an individual bidder |
| `POST` | `/api/verification/run-tender/{tender_id}` | None | `{ verified_count, tender_id, results: [...] }` | Batch verifies all bidders assigned to a specific tender |
| `POST` | `/api/verification/run-all` | None | `{ verified_count, results: [...] }` | Global batch verification across all bidders in the database |
| `POST` | `/api/verification/reset` | None | `{ status: "success", message: "..." }` | Resets all bidders back to `PENDING` unverified state for testing |

### Documents Router (`/api/documents`)
| Method | Endpoint | Request | Response Shape | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/documents/upload` | `multipart/form-data: file, doc_type, bidder_id` | `DocumentResponse` | Ingests PDF, performs OCR and AI statutory extraction |
| `GET` | `/api/documents` | `bidder_id` (optional) | `List[DocumentResponse]` | Lists uploaded documents |

### Audit Router (`/api/audit`)
| Method | Endpoint | Query Params | Response Shape | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/audit` | `bidder_id`, `action`, `limit` | `List[AuditLogResponse]` | Returns immutable chronological audit ledger entries |

---

## 8. Frontend Design System & Component Reference

### Color Palette Tokens (`frontend/src/index.css`)
```css
:root {
  /* Government Light Theme Palette */
  --bg-app: #f8fafc;                /* Professional Light Slate background */
  --bg-surface: #ffffff;            /* Pure White card surfaces */
  --bg-surface-elevated: #f1f5f9;   /* Hover and elevated states */
  --sidebar-bg: #1e3a5f;            /* Deep Government Navy */
  
  /* Accent Colors */
  --primary: #f97316;               /* Indian Saffron primary action accent */
  --primary-hover: #ea580c;
  --primary-glow: rgba(249, 115, 22, 0.15);
  --text-primary: #0f172a;          /* Deep Slate text */
  --text-secondary: #475569;        /* Medium Slate caption text */
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;          /* Clean subtle borders */
  --border-glass: #cbd5e1;

  /* Statutory Status Tiers */
  --status-success: #16a34a;        /* Compliant Green */
  --status-warning: #d97706;        /* Warning Amber */
  --status-danger: #dc2626;         /* Critical Danger Red */
  --status-info: #6b7280;           /* Neutral Slate / Pending */
}
```

### National Tricolor Header Accent
Implemented via a pure CSS top border stripe on `.app-header::before`:
```css
.app-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #138808 100%);
}
```

### Components Deep-Dive

#### 1. `DashboardView.jsx` (`frontend/src/components/Dashboard/`)
- **Eyebrow Status Badge**: Displays `[ • 10 Bids Awaiting Statutory Verification ]` above the main title. Automatically adapts to `All Registered Bids Fully Evaluated` once batch verification finishes.
- **Top Action Area**: Houses `Reset Demo State` button (with rotating icon) and `Run Batch Verification` button (with pulse effect and Saffron indeterminate progress bar).
- **Stat Cards with `useCountUp` Animation**:
  - `Total Enrolled Bidders`: 10 (GeM Seller Registry Feed).
  - `Avg Compliance Score`: Animated percentage (shows `--` when unverified).
  - `Pending Verification`: Displays pending count with clock icon.
  - `Critical / High Risk Flags`: Number of flagged bidders requiring vigilance.
- **Dynamic Charts**:
  - Unverified State: Shows an informative callout box inviting the officer to execute batch verification.
  - Evaluated State: Renders Recharts **Score Distribution Bar Chart** (categorized by risk tiers) and **Risk Level Donut Chart**.
- **Live Bidder Evaluation Overview Table**: Displays all 10 bidders with GSTIN, score, risk badge, status badge, and an instant `Verify Now` / `Inspect` action button.

#### 2. `BiddersView.jsx` (`frontend/src/components/Bidders/`)
- **Status Filter Chips**: Quick filtering by status: `All (10)` | `Pending (X)` | `Verified (Y)` | `Flagged (Z)` | `Rejected (W)`.
- **Search Bar**: Instant text search across legal company names, trade names, GSTINs, and GeM seller IDs.
- **Adaptive SVG `ComplianceGauge`**:
  - Circumference: `283px` (`2 * Math.PI * 45`).
  - Animates `strokeDashoffset` dynamically based on score.
  - When unverified / pending: Renders `--` in neutral slate (`#94a3b8`) with subtitle `Pending`.
  - When verified: Renders color-coded score (`#16a34a` Green, `#d97706` Amber, `#ea580c` Orange, `#dc2626` Red).
- **Statutory ID Pill Grid**: Four structured cards displaying Form GST REG-06 GSTIN, Income Tax PAN, MCA21 CIN, and MSME URN in `JetBrains Mono`.
- **Portal Verification Checks Section**:
  - When unverified: Displays an informative explanation of the 5 statutory portals with an `Execute Statutory Audit` trigger button.
  - When evaluated: Displays discrete cards for each portal check with discrepancy warnings (e.g. `⚠ OEM authorization expired on 31-12-2024`).
- **AI Recommendation Quote Card**: Renders the 3-4 sentence plain-English evaluation report generated by Gemini 3.5 Flash Lite with colored border accents.
- **Nodal Officer Decision Console**: Textarea for justification notes and three binding administrative actions (Approve, Flag for Physical Inspection, Reject & Debar). Disabled with an informative notice if the bid is unverified. Includes sliding toast notification feedback (`toast-success`, `toast-warning`, `toast-error`).

#### 3. `TendersView.jsx` (`frontend/src/components/Tenders/`)
- Lists active EIL procurement tenders.
- Shows live enrolled bidder counts per tender (e.g. `3 Bidders Enrolled`).
- Dynamic status badges: `Bids Staged`, `All Verified`, `Flags Detected`, `Critical / Debarred`.
- Displays required statutory checks as badges (`OEM_AUTHORIZATION`, `UDYAM`, `GST`).
- "Evaluate Bids" action transitions into `BiddersView` scoped specifically to that tender.

---

## 9. Ground-Truth Test Dataset Matrix

The platform is seeded with 10 vendors based on `DATASET/06_GROUND_TRUTH/compliance_labels.csv`:

| ID | Company Name | GSTIN | Assigned Tender | Check Evaluated | Status | Penalties | Score | Risk | Ground-Truth Test Scenario |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `B001` | **Bharat Industrial Systems** | `99AA01B1234C1Z1` | *Bina Petchem (909232)* | OEM, Debarment | `COMPLIANT` | 0.0 | **100.0** | **LOW** | Valid active OEM authorization, not debarred. |
| `B002` | **Eastern Process Equipment** | `99AA02B1234C1Z2` | *Numaligarh (915736)* | Udyam, Debarment | `COMPLIANT` | 0.0 | **100.0** | **LOW** | Valid active MSME registration, not debarred. |
| `B003` | **Apex Flow Technologies** | `99AA03B1234C1Z3` | *Bina Petchem (909232)* | OEM, Debarment | `NON_COMPLIANT` | -50.0 | **50.0** | **HIGH** | OEM authorization expired on 31-12-2024. |
| `B004` | **Nova Engineering Solutions** | `99AA04B1234C1Z4` | *PLL Monitor (912228)* | GST, Debarment | `NON_COMPLIANT` | -50.0 | **50.0** | **HIGH** | Synthetic GST registry reports status as `INVALID`. |
| `B005` | **Shakti Mechanical Works** | `99AA05B1234C1Z5` | *Numaligarh (915736)* | Udyam, Debarment | `MISSING` | -50.0 | **50.0** | **HIGH** | Valid Udyam registry record exists, but certificate doc missing. |
| `B006` | **Precision Pumps India** | `99AA06B1234C1Z6` | *PLL Monitor (912228)* | GST, Debarment | `MISMATCH` | -25.0 | **75.0** | **MEDIUM** | Submitted GST certificate reads *"Precision Pumping Systems Pvt Ltd"*. |
| `B007` | **Assam Industrial Products** | `99AA07B1234C1Z7` | *Numaligarh (915736)* | Udyam, Debarment | `MISMATCH` | -25.0 | **75.0** | **MEDIUM** | Registry lists name as *"Assam Industrial Product Works Pvt Ltd"*. |
| `B008` | **Delta Process Systems** | `99AA08B1234C1Z8` | *Bina Petchem (909232)* | OEM, Debarment | `NON_COMPLIANT` | -50.0 | **50.0** | **HIGH** | OEM letter issued to *"Delta Process Engineering Pvt Ltd"*, not bidder. |
| `B009` | **Meridian Engineering** | `99AA09B1234C1Z9` | *Numaligarh (915736)* | Debarment, Udyam | `CRITICAL` | -100.0 | **0.0** | **CRITICAL** | Debarred on Central Watchlist for tender rigging (GFR 151). |
| `B010` | **National Process Equipment** | `99AA10B1234C1Z0` | *PLL Monitor (912228)* | GST, Debarment | `INCOMPLETE` | -25.0 | **75.0** | **MEDIUM** | Form GST REG-06 omits Trade Name, Reg Date, and Address. |

---

## 10. Operations, Commands & CLI Reference

### 1. Starting the Application
- **Start Backend**:
  ```powershell
  python -m backend.main
  ```
  *(Listens on `http://127.0.0.1:8000`. Auto-creates tables and seeds 10 unverified bidders and 3 tenders if database does not exist).*
- **Start Frontend**:
  ```powershell
  npm run dev --prefix frontend
  ```
  *(Listens on `http://localhost:5173` with proxy forwarding `/api` to port 8000).*

### 2. Testing & Validating the Build
- **Frontend Production Build**:
  ```powershell
  npm run build --prefix frontend
  ```
- **Backend Import & Router Verification**:
  ```powershell
  python -c "import backend.main; print('Backend loaded cleanly!')"
  ```

### 3. Python CLI One-Liners for Maintenance & Verification
- **Reset All Bidders to PENDING (Unverified)**:
  ```powershell
  python -c "from backend.database import SessionLocal; from backend.routers.verification import reset_verification_state; db = SessionLocal(); print(reset_verification_state(db))"
  ```
- **Execute Global Batch Verification via CLI**:
  ```powershell
  python -c "from backend.database import SessionLocal; from backend.routers.verification import run_all_verifications; import asyncio; db = SessionLocal(); res = asyncio.run(run_all_verifications(db)); print('Verified count:', res['verified_count'])"
  ```
- **Inspect Current Database Scores & Risk Tiers**:
  ```powershell
  python -c "from backend.database import SessionLocal; from backend.models.bidder import Bidder; db = SessionLocal(); [print(f'{b.company_name} -> Score: {b.overall_score}, Status: {b.verification_status}, Risk: {b.risk_level}') for b in db.query(Bidder).all()]"
  ```
