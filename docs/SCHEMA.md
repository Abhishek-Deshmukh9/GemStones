# SCHEMA.md - GeMStones Database & API Schema Reference

## Overview
GeMStones uses an embedded SQLite database (`backend/gemstones.db`) accessed via SQLAlchemy ORM. All models are defined in `backend/models/`.

---

## 1. Core Database Models

### `bidders` Table
Represents a vendor registered or applying on GeM.
| Column | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | Integer (PK) | Unique internal ID | `1` |
| `company_name` | String(255) | Official registered company name | `"Apex Infotech Pvt Ltd"` |
| `trade_name` | String(255) | Commercial/DBA trade name | `"Apex Cloud Solutions"` |
| `gem_seller_id` | String(64), Unique | GeM portal seller ID | `"GEM-SELLER-904128"` |
| `gstin` | String(15), Unique | 15-char Goods & Services Tax ID | `"29AABCB1234A1Z5"` |
| `pan` | String(10) | 10-char Income Tax PAN | `"AABCB1234A"` |
| `cin` | String(21), Nullable | Corporate ID Number (MCA21) | `"U72200KA2018PTC112345"` |
| `udyam_reg_number` | String(19), Nullable | URN (Ministry of MSME) | `"UDYAM-KR-03-0012345"` |
| `msme_category` | Enum(Micro, Small, Medium, Large) | Enterprise categorization | `"Small"` |
| `epfo_code` | String(32), Nullable | EPFO Establishment Code | `"KN/BLR/0045231/000"` |
| `esic_number` | String(17), Nullable | ESIC Employer Code | `"53-00-098234-000-0001"` |
| `registered_address` | Text | Official address on record | `"No. 42, 4th Cross, Electronic City, Bengaluru"` |
| `state_code` | String(2) | 2-digit Indian State code | `"29"` (Karnataka) |
| `risk_level` | Enum(LOW, MEDIUM, HIGH, CRITICAL) | Calculated risk tier | `"LOW"` |
| `overall_score` | Float | Compliance percentage (0-100) | `98.5` |
| `verification_status` | Enum(PENDING, VERIFIED, FLAGGED, REJECTED) | Current status | `"VERIFIED"` |
| `created_at` | DateTime | Timestamp of creation | `2026-09-09 10:00:00` |
| `updated_at` | DateTime | Timestamp of last modification | `2026-09-09 10:00:00` |

---

### `verification_checks` Table
Individual checks against government portals.
| Column | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | Integer (PK) | Primary Key | `1` |
| `bidder_id` | Integer (FK -> bidders.id) | Associated bidder | `1` |
| `portal_name` | Enum(GSTN, MCA21, UDYAM, EPFO, ESIC, GEM_WATCHLIST) | Portal checked | `"GSTN"` |
| `check_type` | String(64) | Specific validation performed | `"STATUS_AND_FILING"` |
| `status` | Enum(PASSED, FAILED, WARNING, PENDING) | Verification result | `"PASSED"` |
| `confidence_score` | Float | Match confidence (0.0 to 1.0) | `0.99` |
| `extracted_value` | Text (JSON) | Value from bidder's claim | `{"gstin": "29AABCB1234A1Z5"}` |
| `portal_value` | Text (JSON) | Value from government portal | `{"status": "Active", "filing": "Current"}` |
| `discrepancy_details` | Text, Nullable | Explanation if mismatched | `null` |
| `checked_at` | DateTime | When the check was executed | `2026-09-09 10:01:23` |

---

### `documents` Table
Uploaded or synthetic government certificates.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Primary Key |
| `bidder_id` | Integer (FK) | Associated bidder |
| `doc_type` | Enum(GST_REG_06, UDYAM_CERT, MCA_COI, PAN_CARD, ITR_V, EPFO_CHALLAN) | Official Form Type |
| `file_name` | String(255) | Original filename |
| `file_path` | String(500) | Local path on disk |
| `extracted_data` | Text (JSON) | Key-value pairs extracted by LLM / OCR |
| `extraction_confidence`| Float | LLM extraction confidence (0-1) |
| `tampering_suspected` | Boolean | True if font, alignment, or ID checksum fails |
| `created_at` | DateTime | Upload timestamp |

---

### `audit_logs` Table
Immutable event log for procurement officer audit trail.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Primary Key |
| `bidder_id` | Integer (FK, Nullable) | Associated bidder |
| `action` | String(128) | Event name (e.g. `VERIFICATION_RUN`, `OFFICER_OVERRIDE`) |
| `actor` | String(128) | Who performed it (`SYSTEM`, `OFFICER_PATEL`) |
| `details` | Text (JSON) | Context / metadata |
| `timestamp` | DateTime | Event timestamp |

---

## 2. Mock Government Portals Data Structures

Simulated responses match real Indian government API payloads:

```json
// Mock GSTN Response
{
  "gstin": "29AABCB1234A1Z5",
  "tradeName": "Apex Cloud Solutions",
  "legalName": "Apex Infotech Pvt Ltd",
  "status": "Active",
  "taxpayerType": "Regular",
  "registrationDate": "2018-04-12",
  "einvoiceStatus": "Enabled",
  "filingGSTR3B": "Filed upto July 2026",
  "filingGSTR1": "Filed upto July 2026"
}
```
