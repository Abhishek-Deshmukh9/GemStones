# ================================================================================
# 🏛️ GeMStones: EXHAUSTIVE DATASET MANIFEST & SPECIFICATION
# Comprehensive Ground Truth, Tenders, Rulebooks, Bidder Documents & Registries
# ================================================================================
# Target Directory: c:\Users\admin\Desktop\GemStones\DATASET\
# Dataset Version: 1.0 (Corrected GeM Compliance Dataset - Commit 47fe542)
# Author: Arpitha (arpitha.r252@gmail.com)
# Document Purpose:
# This document is an exhaustive, granular reference that explains the exact files,
# schemas, rows, values, test cases, rules, and data contracts contained in the 
# DATASET/ directory. Any AI agent or software engineer can read ONLY this document
# to gain 100% complete understanding of the entire dataset without having to inspect
# or open any files inside DATASET/.
# ================================================================================

---

## TABLE OF CONTENTS
1. [DIRECTORY TOPOLOGY & OVERVIEW](#1-directory-topology--overview)
2. [SECTION 1: TENDER SPECIFICATIONS (01_TENDER/)](#section-1-tender-specifications-01_tender)
3. [SECTION 2: STATUTORY RULEBOOKS & REGULATIONS (02_RULEBOOK/)](#section-2-statutory-rulebooks--regulations-02_rulebook)
4. [SECTION 3: SYNTHETIC BIDDER SUBMISSIONS & TEST SCENARIOS (03_BIDDER_DOCUMENTS/)](#section-3-synthetic-bidder-submissions--test-scenarios-03_bidder_documents)
5. [SECTION 4: GOVERNMENT & SIMULATED REGISTRIES (04_REGISTRIES/ & 05_MOCK_REGISTRIES/)](#section-4-government--simulated-registries-04_registries--05_mock_registries)
6. [SECTION 5: GROUND TRUTH COMPLIANCE MATRIX (06_GROUND_TRUTH/)](#section-5-ground-truth-compliance-matrix-06_ground_truth)
7. [SECTION 6: EXTRACTION EVIDENCE & AUDIT TRAIL (07_EVIDENCE/)](#section-6-extraction-evidence--audit-trail-07_evidence)
8. [SECTION 7: CODEBASE INTEGRATION ARCHITECTURE](#section-7-codebase-integration-architecture)

---

## 1. DIRECTORY TOPOLOGY & OVERVIEW

The `DATASET/` directory contains 7 primary folders and 1 root overview file (`README.txt`):

```
DATASET/
├── README.txt                                  <- Dataset notice & intended test cases
├── 01_TENDER/                                  <- 3 structured tender definitions (JSON)
│   ├── TENDER_001/tender_details.json
│   ├── TENDER_002/tender_details.json
│   └── TENDER_003/tender_details.json
├── 02_RULEBOOK/                                <- 5 official Indian procurement policy PDFs
│   ├── 01_Manual_for_Procurement_of_Goods_2024.pdf
│   ├── 02_GFR_2017_Updated_31Jan2026.pdf
│   ├── 03_Debarment_Guidelines_2021.pdf
│   ├── 04_Debarment_Guidelines_Amendment_2026.pdf
│   └── 05_GFR_Rule151_Amendment_2026.pdf
├── 03_BIDDER_DOCUMENTS/                        <- 10 synthetic bidders with PDFs + ground truth
│   ├── README.txt
│   ├── GROUND_TRUTH.csv
│   └── B001/ ... B010/                         <- PDF folders (GST, UDYAM, OEM)
├── 04_REGISTRIES/                              <- Debarment / Blacklist database
│   └── debarment_registry_synthetic.csv
├── 05_MOCK_REGISTRIES/                         <- External portal simulation CSV tables
│   ├── gst_registry.csv
│   ├── udyam_registry.csv
│   ├── oem_registry.csv
│   └── registry_test_cases.csv
├── 06_GROUND_TRUTH/                            <- Master compliance truth matrix
│   └── compliance_labels.csv
└── 07_EVIDENCE/                                <- 149 field-level audit extractions
    └── evidence.csv
```

### Core Design Philosophy of the Dataset:
- **Tender-Specific Compliance**: Not every tender demands every certificate. Compliance evaluation is strictly contextual to what the tender's Notice Inviting Tender (NIT) mandates.
- **Document vs. Registry Discrepancy**: Designed specifically to test whether an AI auditor catches discrepancies between what a vendor submits on paper and what official government databases record.
- **Edge-Case Completeness**: Explicitly exercises missing documents, expired authorizations, name mismatches (legal name vs. trade name vs. bid name), forged status claims, and active debarment/blacklisting.

---

## SECTION 1: TENDER SPECIFICATIONS (01_TENDER/)

All 3 tenders are modeled on real Central Public Procurement Portal (CPPP) / GeM tenders issued by **Engineers India Limited (EIL)** under the **Ministry of Petroleum and Natural Gas**.

### 1.1 TENDER_001: Flame Arrestors & Tank Pressure Protection Devices
- **File**: `DATASET/01_TENDER/TENDER_001/tender_details.json`
- **Tender ID**: `2026_EIL_909232_1`
- **Tender Title**: `SP/ B957-000-YB-MR-1380/162 TANK PR. PROTECT. DEVICES / FLAME ARRSTR FOR BINA PETCHEM AND REFINERY EXPANSION PROJECT (BPREP)`
- **Organisation**: Engineers India Limited
- **Ministry / Department**: Ministry of Petroleum and Natural Gas
- **Category**: Goods / Miscellaneous Goods
- **Key Dates**:
  - Published: `04-Jun-2026 05:00 PM`
  - Closing: `15-Sep-2026 12:00 PM`
  - Bid Opening: `16-Sep-2026 12:00 PM`
- **Commercials**: EMD: ₹4,00,000 (INR 4 Lakhs) | Tender Value: Null (Item-rate)
- **Mandatory Covers & Submission Requirements**:
  1. `EMD/Bid Security` (`BID_SECURITY`) — Cover 1 (Fee)
  2. `Offer Covering letter` (`DOCUMENT_SUBMISSION`) — Cover 2 (PreQual/Technical)
  3. `Bidders General Information (Form-A)` (`DOCUMENT_SUBMISSION`) — Cover 2
  4. `Techno-Commercial compliance (Form-B)` (`DOCUMENT_SUBMISSION`) — Cover 2
  5. `Agreed Terms and Conditions (ATC) (Form-C)` (`DOCUMENT_SUBMISSION`) — Cover 2
  6. `Bank Certified Mandate Form (Form-D)` (`BANK_MANDATE`) — Cover 2
  7. `Self-declaration regarding Holiday/Negative listing (FORM-G)` (`DECLARATION`) — Cover 2
  8. `Unpriced copy of Price Schedule (BOQ)` (`PRICE_SCHEDULE`) — Cover 2
  9. `Signed Addendum/Amendment` (`DOCUMENT_SUBMISSION`) — Cover 2
  10. `Documents for Technical Criteria (Clause 3.1 NIT)` (`TECHNICAL_CRITERIA`) — Cover 2
  11. `Documents for Financial Criteria (Clause 3.2 NIT)` (`FINANCIAL_CRITERIA`) — Cover 2
  12. `Self Certification under PPP-MII Order 2017 (Local Content)` (`PPP_MII`) — Cover 2
  13. `Price Bid` (`PRICE_BID`) — Cover 3 (Finance)
- **Special Evaluation Condition (OEM Authorization)**:
  - `oem_requirements`: `[{"requirement": "OEM Authorization Letter confirming bidder is an authorized dealer/representative...", "compliance_type": "OEM_AUTHORIZATION"}]`
  - *Note*: Added synthetically to allow automated testing of OEM authorization validity, expiry, and bidder name alignment.
- **Assigned Bidders for Evaluation**: `B001` (Compliant), `B003` (Expired OEM), `B008` (OEM Bidder Mismatch).

---

### 1.2 TENDER_002: Reciprocating Pumps (Numaligarh Refinery)
- **File**: `DATASET/01_TENDER/TENDER_002/tender_details.json`
- **Tender ID**: `2026_EIL_915736_1`
- **Tender Title**: `SS/C050-1P39A-PA-MR-5100/50 - PUMP-RECIPRO(API 675,PLUNGER/DIAPHRAGM) FOR POLYPROPYLENE PROJECT OF M/S NUMALIGARH REFINERY LIMITED`
- **Organisation**: Engineers India Limited
- **Key Dates**:
  - Published: `02-Sep-2026 03:00 PM`
  - Closing: `30-Sep-2026 12:00 PM`
  - Bid Opening: `01-Oct-2026 02:00 PM`
- **Commercials**: EMD: ₹0 (Exempted)
- **Mandatory Covers & Submission Requirements**:
  1. `Proposal Forms and Formats as per ITB` (`DOCUMENT_SUBMISSION`) — Cover 1
  2. `Integrity Pact as per ITB` (`INTEGRITY_PACT`) — Cover 1
  3. `Commercial and Technical Amendments Acceptance` (`DOCUMENT_SUBMISSION`) — Cover 1
  4. `Unpriced BOQ Schedule` (`PRICE_SCHEDULE`) — Cover 1
  5. `Undertaking for Land Border Sharing (Form A)` (`LAND_BORDER_SHARING`) — Cover 1
  6. `Declaration under PPP-MII Policy` (`PPP_MII`) — Cover 1
  7. `Price Bid BOQ` (`PRICE_BID`) — Cover 2
- **Special Evaluation Condition (MSME / Udyam Certificate)**:
  - `msme_requirements`: `[{"requirement": "MSE (Udyam Certificate) documents, if applicable", "compliance_type": "UDYAM"}]`
- **Assigned Bidders for Evaluation**: `B002` (Compliant), `B005` (Missing Udyam doc), `B007` (Udyam Name Mismatch), `B009` (Debarred Bidder).

---

### 1.3 TENDER_003: Water cum Foam Fire Monitors & Deluge Valves
- **File**: `DATASET/01_TENDER/TENDER_003/tender_details.json`
- **Tender ID**: `2026_EIL_912228_1`
- **Tender Title**: `JP/ B862-000-MF-MR-8002/109 - WATER CUM FOAM MONITOR, REMOTE CONTROLLED FIRE WATER CUM FOAM MONITOR, DELUGE VALVE (Diaphragm Type) FOR PLL.`
- **Organisation**: Engineers India Limited
- **Key Dates**:
  - Published: `09-Jun-2026 06:00 PM`
  - Closing: `23-Sep-2026 12:00 PM`
  - Bid Opening: `24-Sep-2026 02:00 PM`
- **Commercials**: EMD: ₹0
- **Mandatory Covers & Submission Requirements**:
  1. `ATC for Indigenous Bidder` (`DOCUMENT_SUBMISSION`) — Cover 1
  2. `Bank Certified Mandate Form (Form-A)` (`BANK_MANDATE`) — Cover 1
  3. `Unpriced BOQ` (`PRICE_SCHEDULE`) — Cover 1
  4. `Power of Attorney (POA)` (`POWER_OF_ATTORNEY`) — Cover 1
  5. `Land Border Sharing (Form IA/II)` (`LAND_BORDER_SHARING`) — Cover 1
  6. `Priced Bid` (`PRICE_BID`) — Cover 2
- **Special Evaluation Condition (GST Registration Certificate)**:
  - `mandatory_documents`: Contains `{"requirement": "Valid GST Registration certificate", "compliance_type": "GST"}`
- **Assigned Bidders for Evaluation**: `B004` (Invalid GST Registry), `B006` (GST Name Mismatch), `B010` (Incomplete GST Certificate).

---

## SECTION 2: STATUTORY RULEBOOKS & REGULATIONS (02_RULEBOOK/)

This directory stores authentic Government of India procurement manuals and statutory orders that form the legal basis for all compliance rules implemented in GeMStones.

| File Name | File Size | Authority / Date | Key Provisions & Impact on System |
|---|---|---|---|
| `01_Manual_for_Procurement_of_Goods_2024.pdf` | 5,395,587 bytes (5.4 MB) | Ministry of Finance, Dept of Expenditure (Updated 2024) | Comprehensive guidelines on tender preparation, evaluation criteria, EMD exemption rules for MSMEs/Startups, local content verification (PPP-MII), and vendor qualification. |
| `02_GFR_2017_Updated_31Jan2026.pdf` | 2,638,873 bytes (2.6 MB) | Ministry of Finance (Current up to Jan 31, 2026) | Fundamental statutory framework governing all Union Government procurements. Defines Rule 144 (General principles), Rule 149 (Mandatory GeM procurement), Rule 151 (Debarment), and Rule 153 (MSME purchase preference). |
| `03_Debarment_Guidelines_2021.pdf` | 2,410,491 bytes (2.4 MB) | Office Memorandum F.1/20/2018-PPD (02 Nov 2021) | Comprehensive codified guidelines on banning and debarment of vendors. Establishes grounds for 2-year to 3-year debarments (corrupt practices, failure to execute, forged documents) and procedural natural justice requirements. |
| `04_Debarment_Guidelines_Amendment_2026.pdf` | 3,149,140 bytes (3.1 MB) | Dept of Expenditure (2026 Revision) | Recent amendments covering digital verification, automated cross-departmental sharing of blacklists, and enforcement across GeM and state agencies. |
| `05_GFR_Rule151_Amendment_2026.pdf` | 635,996 bytes (636 KB) | Ministry of Finance (2026 Amendment) | Statutory amendment to Rule 151 of GFR 2017 specifying strict liability and mandatory nationwide debarment for any bidder submitting forged statutory certificates (GST, MSME, OEM) in government bids. |

---

## SECTION 3: SYNTHETIC BIDDER SUBMISSIONS & TEST SCENARIOS (03_BIDDER_DOCUMENTS/)

Ten bidders (`B001` to `B010`) are defined. Each bidder represents a specifically engineered compliance scenario.

### 3.1 Master Bidder Profile & Scenario Matrix

| Bidder ID | Bidder Legal Name | Assigned Tender | Document Folders Present | Designed Test Defect / Scenario | Expected Risk |
|---|---|---|---|---|---|
| **B001** | Bharat Industrial Systems Pvt Ltd | `TENDER_001` | `GST`, `OEM`, `UDYAM` | Perfectly compliant across all documents & registries. Active OEM authorization. | **LOW** 🟢 |
| **B002** | Eastern Process Equipment Pvt Ltd | `TENDER_002` | `GST`, `OEM`, `UDYAM` | Perfectly compliant. Valid Udyam MSME certificate matching registry. | **LOW** 🟢 |
| **B003** | Apex Flow Technologies Pvt Ltd | `TENDER_001` | `GST`, `OEM`, `UDYAM` | **Expired OEM Authorization**. Certificate and registry both show validity ended `31-12-2024`. | **HIGH** 🔴 |
| **B004** | Nova Engineering Solutions Pvt Ltd | `TENDER_003` | `GST`, `OEM`, `UDYAM` | **Registry Fraud / Invalid GST**. Document claims `Status: ACTIVE`, but GST registry returns `INVALID`. | **HIGH** 🔴 |
| **B005** | Shakti Mechanical Works | `TENDER_002` | `GST`, `OEM` (NO `UDYAM`) | **Missing Mandatory Document**. Tender requires Udyam certificate; bidder failed to upload it even though registry record exists. | **HIGH** 🔴 |
| **B006** | Precision Pumps India Pvt Ltd | `TENDER_003` | `GST`, `OEM`, `UDYAM` | **Legal Name Mismatch**. Bidder is `Precision Pumps India Pvt Ltd`, but GST certificate legal name says `Precision Pumping Systems Pvt Ltd`. | **MEDIUM** 🟡 |
| **B007** | Assam Industrial Products Pvt Ltd | `TENDER_002` | `GST`, `OEM`, `UDYAM` | **Enterprise Name Mismatch**. Bidder is `Assam Industrial Products Pvt Ltd`, but Udyam certificate says `Assam Industrial Product Works Pvt Ltd`. | **MEDIUM** 🟡 |
| **B008** | Delta Process Systems Pvt Ltd | `TENDER_001` | `GST`, `OEM`, `UDYAM` | **OEM Authorization Mismatch**. OEM letter authorizes `Delta Process Engineering Pvt Ltd`, not the bidding entity `Delta Process Systems Pvt Ltd`. | **HIGH** 🔴 |
| **B009** | Meridian Engineering Pvt Ltd | `TENDER_002` | `GST`, `OEM`, `UDYAM` | **Debarred / Blacklisted Bidder**. Documents are technically valid, but bidder is listed on the government Debarment Registry (2026–2028). | **HIGH / CRITICAL** 🔴 |
| **B010** | National Process Equipment Pvt Ltd | `TENDER_003` | `GST` (NO `UDYAM`, NO `OEM`) | **Incomplete / Defective Certificate**. GST certificate omitted Trade Name, Reg Date, Address, and has status `FIELD INCOMPLETE`. | **HIGH** 🔴 |

---

### 3.2 Granular Content of Bidder Documents

Every certificate is a structured, single-page PDF containing an official tabular summary:

#### 1. GST Registration Certificates (`.../GST/gst_certificate.pdf`)
- Fields: `Certificate Type`, `GSTIN`, `Legal Name`, `Trade Name`, `Registration Date`, `Status`, `Principal Address`
- Sample Values across bidders:
  - `B001`: GSTIN `99AA01B1234C1Z1` | Legal: `Bharat Industrial Systems Pvt Ltd` | Trade: `Bharat Industrial Systems Pvt Ltd` | Date: `15-01-2024` | Status: `ACTIVE` | Address: `Plot 11, Industrial Estate, Example District, India`
  - `B002`: GSTIN `99AA02B1234C1Z2` | Legal: `Eastern Process Equipment Pvt Ltd` | Date: `15-02-2024` | Status: `ACTIVE`
  - `B003`: GSTIN `99AA03B1234C1Z3` | Legal: `Apex Flow Technologies Pvt Ltd` | Date: `15-03-2024` | Status: `ACTIVE`
  - `B004`: GSTIN `99AA04B1234C1Z4` | Legal: `Nova Engineering Solutions Pvt Ltd` | Date: `15-04-2024` | Status on PDF: `ACTIVE` *(Registry shows INVALID)*
  - `B005`: GSTIN `99AA05B1234C1Z5` | Legal: `Shakti Mechanical Works` | Date: `15-05-2024` | Status: `ACTIVE`
  - `B006`: GSTIN `99AA06B1234C1Z6` | Legal: `Precision Pumping Systems Pvt Ltd` *(Mismatch)* | Trade: `Precision Pumps India Pvt Ltd` | Date: `15-06-2024`
  - `B007`: GSTIN `99AA07B1234C1Z7` | Legal: `Assam Industrial Products Pvt Ltd` | Date: `15-07-2024` | Status: `ACTIVE`
  - `B008`: GSTIN `99AA08B1234C1Z8` | Legal: `Delta Process Systems Pvt Ltd` | Date: `15-08-2024` | Status: `ACTIVE`
  - `B009`: GSTIN `99AA09B1234C1Z9` | Legal: `Meridian Engineering Pvt Ltd` | Date: `15-09-2024` | Status: `ACTIVE`
  - `B010`: GSTIN `99AA10B1234C1Z0` | Legal: `National Process Equipment Pvt Ltd` | Trade: *[MISSING]* | Reg Date: *[MISSING]* | Address: *[MISSING]* | Status: `FIELD INCOMPLETE / VERIFICATION REQUIRED`

#### 2. Udyam MSME Certificates (`.../UDYAM/udyam_certificate.pdf`)
- Fields: `Certificate Type`, `Udyam Registration Number`, `Enterprise Name`, `Enterprise Type`, `Registration Date`, `Status`, `Address`
- Sample Values across bidders:
  - `B001`: `UDYAM-XX-00-000001` | Enterprise: `Bharat Industrial Systems Pvt Ltd` | Type: `Small` | Date: `20-01-2024` | Status: `ACTIVE`
  - `B002`: `UDYAM-XX-00-000002` | Enterprise: `Eastern Process Equipment Pvt Ltd` | Type: `Small` | Date: `20-02-2024` | Status: `ACTIVE`
  - `B003`: `UDYAM-XX-00-000003` | Enterprise: `Apex Flow Technologies Pvt Ltd` | Type: `Small` | Date: `20-03-2024` | Status: `ACTIVE`
  - `B004`: `UDYAM-XX-00-000004` | Enterprise: `Nova Engineering Solutions Pvt Ltd` | Type: `Small` | Date: `20-04-2024` | Status: `ACTIVE`
  - `B005`: *[DOCUMENT NOT SUBMITTED BY BIDDER]*
  - `B006`: `UDYAM-XX-00-000006` | Enterprise: `Precision Pumps India Pvt Ltd` | Type: `Small` | Date: `20-06-2024` | Status: `ACTIVE`
  - `B007`: `UDYAM-XX-00-000007` | Enterprise: `Assam Industrial Product Works Pvt Ltd` *(Mismatch with bidder name)* | Type: `Small` | Date: `20-07-2024`
  - `B008`: `UDYAM-XX-00-000008` | Enterprise: `Delta Process Systems Pvt Ltd` | Type: `Small` | Date: `20-08-2024` | Status: `ACTIVE`
  - `B009`: `UDYAM-XX-00-000009` | Enterprise: `Meridian Engineering Pvt Ltd` | Type: `Small` | Date: `20-09-2024` | Status: `ACTIVE`
  - `B010`: *[DOCUMENT NOT SUBMITTED BY BIDDER]*

#### 3. OEM Authorization Letters (`.../OEM/oem_authorization.pdf`)
- Fields: `Document Type`, `OEM Name`, `Authorization Number`, `Authorized Bidder`, `Issue Date`, `Valid From`, `Valid Until`, `Product / Equipment`, `Authorized Signatory`
- Sample Values across bidders:
  - `B001`: OEM: `Trident Process Systems Ltd` | Auth No: `OEM-AUTH-SYN-0001` | Authorized: `Bharat Industrial Systems Pvt Ltd` | Valid: `01-01-2026` to `31-12-2027` (ACTIVE)
  - `B002`: OEM: `Trident Process Systems Ltd` | Auth No: `OEM-AUTH-SYN-0002` | Authorized: `Eastern Process Equipment Pvt Ltd` | Valid: `01-01-2026` to `31-12-2027` (ACTIVE)
  - `B003`: OEM: `Orion Industrial Equipment Ltd` | Auth No: `OEM-AUTH-SYN-0003` | Authorized: `Apex Flow Technologies Pvt Ltd` | Valid From: `01-01-2024` | Valid Until: `31-12-2024 (EXPIRED)`
  - `B004`: OEM: `Orion Industrial Equipment Ltd` | Auth No: `OEM-AUTH-SYN-0004` | Authorized: `Nova Engineering Solutions Pvt Ltd` | Valid: `01-01-2026` to `31-12-2027` (ACTIVE)
  - `B005`: OEM: `Trident Process Systems Ltd` | Auth No: `OEM-AUTH-SYN-0005` | Authorized: `Shakti Mechanical Works` | Valid: `01-01-2026` to `31-12-2027` (ACTIVE)
  - `B006`: OEM: `National Fluid Controls Ltd` | Auth No: `OEM-AUTH-SYN-0006` | Authorized: `Precision Pumps India Pvt Ltd` | Valid: `01-01-2026` to `31-12-2027` (ACTIVE)
  - `B007`: OEM: `Orion Industrial Equipment Ltd` | Auth No: `OEM-AUTH-SYN-0007` | Authorized: `Assam Industrial Products Pvt Ltd` | Valid: `01-01-2026` to `31-12-2027` (ACTIVE)
  - `B008`: OEM: `National Fluid Controls Ltd` | Auth No: `OEM-AUTH-SYN-0008` | Authorized: `Delta Process Engineering Pvt Ltd` *(Mismatch: Bidder is Delta Process Systems Pvt Ltd)* | Valid: `01-01-2026` to `31-12-2027`
  - `B009`: OEM: `National Fluid Controls Ltd` | Auth No: `OEM-AUTH-SYN-0009` | Authorized: `Meridian Engineering Pvt Ltd` | Valid: `01-01-2026` to `31-12-2027` (ACTIVE)
  - `B010`: *[DOCUMENT NOT SUBMITTED BY BIDDER]*

---

## SECTION 4: GOVERNMENT & SIMULATED REGISTRIES (04_REGISTRIES/ & 05_MOCK_REGISTRIES/)

These CSV tables simulate live API query responses from statutory government databases.

### 4.1 Debarment / Blacklist Registry
- **File**: `DATASET/04_REGISTRIES/debarment_registry_synthetic.csv`
- **Total Records**: 2

| bidder_name | bidder_id | debarment_status | debarred_by | effective_from | effective_until | reason | source_type |
|---|---|---|---|---|---|---|---|
| Meridian Engineering Pvt Ltd | B009 | **DEBARRED** | Synthetic Procurement Authority | 01-06-2026 | 31-05-2028 | Synthetic test case for debarment verification | SYNTHETIC TEST DATA |
| Example Compliance Services Pvt Ltd | [null] | NOT_DEBARRED | [null] | [null] | [null] | Synthetic control record | SYNTHETIC TEST DATA |

---

### 4.2 GSTN Mock Registry
- **File**: `DATASET/05_MOCK_REGISTRIES/gst_registry.csv`
- **Columns**: `gstin`, `legal_name`, `status`, `registration_date`, `cancellation_date`, `source`

| gstin | legal_name | status | registration_date | cancellation_date |
|---|---|---|---|---|
| `99AA01B1234C1Z1` | Bharat Industrial Systems Pvt Ltd | `ACTIVE` | 15-01-2024 | [null] |
| `99AA02B1234C1Z2` | Eastern Process Equipment Pvt Ltd | `ACTIVE` | 15-02-2024 | [null] |
| `99AA03B1234C1Z3` | Apex Flow Technologies Pvt Ltd | `ACTIVE` | 15-03-2024 | [null] |
| `99AA04B1234C1Z4` | Nova Engineering Solutions Pvt Ltd | **`INVALID`** | 15-04-2024 | [null] |
| `99AA05B1234C1Z5` | Shakti Mechanical Works | `ACTIVE` | 15-05-2024 | [null] |
| `99AA06B1234C1Z6` | Precision Pumps India Pvt Ltd | `ACTIVE` | 15-06-2024 | [null] |
| `99AA07B1234C1Z7` | Assam Industrial Products Pvt Ltd | `ACTIVE` | 15-07-2024 | [null] |
| `99AA08B1234C1Z8` | Delta Process Systems Pvt Ltd | `ACTIVE` | 15-08-2024 | [null] |
| `99AA09B1234C1Z9` | Meridian Engineering Pvt Ltd | `ACTIVE` | 15-09-2024 | [null] |
| `99AA10B1234C1Z0` | National Process Equipment Pvt Ltd | `ACTIVE` | 15-10-2024 | [null] |

*Critical Observation*: Notice that for `B004`, the GST registry explicitly flags the GSTIN as `INVALID`, catching fraudulent certificates. For `B006`, the registry legal name is `Precision Pumps India Pvt Ltd`, matching the bidder name, which proves the submitted certificate had the incorrect entity name (`Precision Pumping Systems`).

---

### 4.3 Udyam / MSME Mock Registry
- **File**: `DATASET/05_MOCK_REGISTRIES/udyam_registry.csv`
- **Columns**: `udyam_number`, `enterprise_name`, `status`, `registration_date`, `source`

| udyam_number | enterprise_name | status | registration_date |
|---|---|---|---|
| `UDYAM-XX-00-000001` | Bharat Industrial Systems Pvt Ltd | `ACTIVE` | 20-01-2024 |
| `UDYAM-XX-00-000002` | Eastern Process Equipment Pvt Ltd | `ACTIVE` | 20-02-2024 |
| `UDYAM-XX-00-000003` | Apex Flow Technologies Pvt Ltd | `ACTIVE` | 20-03-2024 |
| `UDYAM-XX-00-000004` | Nova Engineering Solutions Pvt Ltd | `ACTIVE` | 20-04-2024 |
| `UDYAM-XX-00-000005` | Shakti Mechanical Works | `ACTIVE` | 20-05-2024 |
| `UDYAM-XX-00-000006` | Precision Pumps India Pvt Ltd | `ACTIVE` | 20-06-2024 |
| `UDYAM-XX-00-000007` | Assam Industrial Product Works Pvt Ltd | `ACTIVE` | 20-07-2024 |
| `UDYAM-XX-00-000008` | Delta Process Systems Pvt Ltd | `ACTIVE` | 20-08-2024 |
| `UDYAM-XX-00-000009` | Meridian Engineering Pvt Ltd | `ACTIVE` | 20-09-2024 |
| `UDYAM-XX-00-000010` | National Process Equipment Pvt Ltd | `ACTIVE` | 20-10-2024 |

*Critical Observation*: For `B005` (Shakti Mechanical Works), a valid active record `UDYAM-XX-00-000005` exists in the government database. This allows the system to distinguish between "vendor is not registered with MSME" and "vendor forgot to attach their certificate in Cover 1".

---

### 4.4 OEM Authorization Mock Registry
- **File**: `DATASET/05_MOCK_REGISTRIES/oem_registry.csv`
- **Columns**: `oem_name`, `authorized_bidder`, `authorization_number`, `valid_from`, `valid_until`, `status`, `source`

| oem_name | authorized_bidder | authorization_number | valid_from | valid_until | status |
|---|---|---|---|---|---|
| Orion Industrial Equipment Ltd | Bharat Industrial Systems Pvt Ltd | `OEM-AUTH-SYN-0001` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| Trident Process Systems Ltd | Eastern Process Equipment Pvt Ltd | `OEM-AUTH-SYN-0002` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| National Fluid Controls Ltd | Apex Flow Technologies Pvt Ltd | `OEM-AUTH-SYN-0003` | 01-01-2024 | 31-12-2024 | **`EXPIRED`** |
| Orion Industrial Equipment Ltd | Nova Engineering Solutions Pvt Ltd | `OEM-AUTH-SYN-0004` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| Trident Process Systems Ltd | Shakti Mechanical Works | `OEM-AUTH-SYN-0005` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| National Fluid Controls Ltd | Precision Pumps India Pvt Ltd | `OEM-AUTH-SYN-0006` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| Orion Industrial Equipment Ltd | Assam Industrial Products Pvt Ltd | `OEM-AUTH-SYN-0007` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| Trident Process Systems Ltd | **Delta Process Engineering Pvt Ltd** | `OEM-AUTH-SYN-0008` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| National Fluid Controls Ltd | Meridian Engineering Pvt Ltd | `OEM-AUTH-SYN-0009` | 01-01-2026 | 31-12-2027 | `ACTIVE` |
| Orion Industrial Equipment Ltd | National Process Equipment Pvt Ltd | `OEM-AUTH-SYN-0010` | 01-01-2026 | 31-12-2027 | `ACTIVE` |

---

### 4.5 Registry Test Cases Cross-Verification Matrix
- **File**: `DATASET/05_MOCK_REGISTRIES/registry_test_cases.csv`

| bidder_id | gst_expected | udyam_expected | oem_expected | debarment_expected |
|---|---|---|---|---|
| `B001` | ACTIVE | ACTIVE | ACTIVE | NOT_DEBARRED |
| `B002` | ACTIVE | ACTIVE | ACTIVE | NOT_DEBARRED |
| `B003` | ACTIVE | ACTIVE | **EXPIRED** | NOT_DEBARRED |
| `B004` | **INVALID** | ACTIVE | ACTIVE | NOT_DEBARRED |
| `B005` | ACTIVE | ACTIVE | ACTIVE | NOT_DEBARRED |
| `B006` | ACTIVE | ACTIVE | ACTIVE | NOT_DEBARRED |
| `B007` | ACTIVE | ACTIVE | ACTIVE | NOT_DEBARRED |
| `B008` | ACTIVE | ACTIVE | ACTIVE | NOT_DEBARRED |
| `B009` | ACTIVE | ACTIVE | ACTIVE | **DEBARRED** |
| `B010` | ACTIVE | ACTIVE | ACTIVE | NOT_DEBARRED |

---

## SECTION 5: GROUND TRUTH COMPLIANCE MATRIX (06_GROUND_TRUTH/)

- **File**: `DATASET/06_GROUND_TRUTH/compliance_labels.csv`
- **Total Entries**: 41 evaluations (covering each tender x bidder x check combination)
- **Status Values**: `COMPLIANT`, `NON_COMPLIANT`, `MISMATCH`, `MISSING`, `INCOMPLETE`, `NOT_APPLICABLE`
- **Risk Level Values**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `N/A`

### Complete 41-Row Ground Truth Reference Table

| Row | Tender ID | Bidder ID | Bidder Name | Requirement | Status | Risk | Detailed Reason |
|---|---|---|---|---|---|---|---|
| 1 | `2026_EIL_909232_1` | `B001` | Bharat Industrial Systems Pvt Ltd | `GST` | `NOT_APPLICABLE` | N/A | GST is not a requirement of this tender (not in tender_details.json); retained as evidence. |
| 2 | `2026_EIL_909232_1` | `B001` | Bharat Industrial Systems Pvt Ltd | `Udyam/MSME` | `NOT_APPLICABLE` | N/A | Udyam/MSME is not required for this tender. |
| 3 | `2026_EIL_909232_1` | `B001` | Bharat Industrial Systems Pvt Ltd | `OEM Authorization` | `COMPLIANT` | **LOW** | Valid, active OEM authorization; authorized bidder matches registry and is unexpired. |
| 4 | `2026_EIL_909232_1` | `B001` | Bharat Industrial Systems Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Bidder does not appear in debarment registry. |
| 5 | `2026_EIL_915736_1` | `B002` | Eastern Process Equipment Pvt Ltd | `GST` | `NOT_APPLICABLE` | N/A | GST not required for this tender. |
| 6 | `2026_EIL_915736_1` | `B002` | Eastern Process Equipment Pvt Ltd | `Udyam/MSME` | `COMPLIANT` | **LOW** | Valid, active Udyam registration; enterprise name matches bidder & registry. |
| 7 | `2026_EIL_915736_1` | `B002` | Eastern Process Equipment Pvt Ltd | `OEM Authorization` | `NOT_APPLICABLE` | N/A | OEM Authorization not required for this tender. |
| 8 | `2026_EIL_915736_1` | `B002` | Eastern Process Equipment Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Bidder does not appear in debarment registry. |
| 9 | `2026_EIL_909232_1` | `B003` | Apex Flow Technologies Pvt Ltd | `GST` | `NOT_APPLICABLE` | N/A | GST not required for this tender. |
| 10 | `2026_EIL_909232_1` | `B003` | Apex Flow Technologies Pvt Ltd | `Udyam/MSME` | `NOT_APPLICABLE` | N/A | Udyam/MSME not required for this tender. |
| 11 | `2026_EIL_909232_1` | `B003` | Apex Flow Technologies Pvt Ltd | `OEM Authorization` | `NON_COMPLIANT` | **HIGH** | OEM authorization expired on 31-12-2024; confirmed by doc & registry. |
| 12 | `2026_EIL_909232_1` | `B003` | Apex Flow Technologies Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Not in debarment registry. |
| 13 | `2026_EIL_912228_1` | `B004` | Nova Engineering Solutions Pvt Ltd | `GST` | `NON_COMPLIANT` | **HIGH** | GST registry reports status as INVALID despite complete certificate. |
| 14 | `2026_EIL_912228_1` | `B004` | Nova Engineering Solutions Pvt Ltd | `Udyam/MSME` | `NOT_APPLICABLE` | N/A | Udyam/MSME not required for this tender. |
| 15 | `2026_EIL_912228_1` | `B004` | Nova Engineering Solutions Pvt Ltd | `OEM Authorization` | `NOT_APPLICABLE` | N/A | OEM Authorization not required for this tender. |
| 16 | `2026_EIL_912228_1` | `B004` | Nova Engineering Solutions Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Not in debarment registry. |
| 17 | `2026_EIL_915736_1` | `B005` | Shakti Mechanical Works | `GST` | `NOT_APPLICABLE` | N/A | GST not required for this tender. |
| 18 | `2026_EIL_915736_1` | `B005` | Shakti Mechanical Works | `Udyam/MSME` | `MISSING` | **HIGH** | Udyam doc not submitted; valid registry record exists, but doc is missing. |
| 19 | `2026_EIL_915736_1` | `B005` | Shakti Mechanical Works | `OEM Authorization` | `NOT_APPLICABLE` | N/A | OEM Authorization not required for this tender. |
| 20 | `2026_EIL_915736_1` | `B005` | Shakti Mechanical Works | `Debarment Status` | `COMPLIANT` | **LOW** | Not in debarment registry. |
| 21 | `2026_EIL_912228_1` | `B006` | Precision Pumps India Pvt Ltd | `GST` | `MISMATCH` | **MEDIUM** | Certificate legal name ("Precision Pumping Systems") differs from bid name. |
| 22 | `2026_EIL_912228_1` | `B006` | Precision Pumps India Pvt Ltd | `Udyam/MSME` | `NOT_APPLICABLE` | N/A | Udyam not required for this tender. |
| 23 | `2026_EIL_912228_1` | `B006` | Precision Pumps India Pvt Ltd | `OEM Authorization` | `NOT_APPLICABLE` | N/A | OEM Authorization not required for this tender. |
| 24 | `2026_EIL_912228_1` | `B006` | Precision Pumps India Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Not in debarment registry. |
| 25 | `2026_EIL_915736_1` | `B007` | Assam Industrial Products Pvt Ltd | `GST` | `NOT_APPLICABLE` | N/A | GST not required for this tender. |
| 26 | `2026_EIL_915736_1` | `B007` | Assam Industrial Products Pvt Ltd | `Udyam/MSME` | `MISMATCH` | **MEDIUM** | Enterprise name ("Assam Industrial Product Works") differs from bid name. |
| 27 | `2026_EIL_915736_1` | `B007` | Assam Industrial Products Pvt Ltd | `OEM Authorization` | `NOT_APPLICABLE` | N/A | OEM Authorization not required for this tender. |
| 28 | `2026_EIL_915736_1` | `B007` | Assam Industrial Products Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Not in debarment registry. |
| 29 | `2026_EIL_909232_1` | `B008` | Delta Process Systems Pvt Ltd | `GST` | `NOT_APPLICABLE` | N/A | GST not required for this tender. |
| 30 | `2026_EIL_909232_1` | `B008` | Delta Process Systems Pvt Ltd | `Udyam/MSME` | `NOT_APPLICABLE` | N/A | Udyam not required for this tender. |
| 31 | `2026_EIL_909232_1` | `B008` | Delta Process Systems Pvt Ltd | `OEM Authorization` | `NON_COMPLIANT` | **HIGH** | OEM letter & registry name "Delta Process Engineering Pvt Ltd", not bidder. |
| 32 | `2026_EIL_909232_1` | `B008` | Delta Process Systems Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Not in debarment registry. |
| 33 | `2026_EIL_915736_1` | `B009` | Meridian Engineering Pvt Ltd | `GST` | `NOT_APPLICABLE` | N/A | GST not required for this tender. |
| 34 | `2026_EIL_915736_1` | `B009` | Meridian Engineering Pvt Ltd | `Udyam/MSME` | `COMPLIANT` | **LOW** | Active Udyam registration matching registry. |
| 35 | `2026_EIL_915736_1` | `B009` | Meridian Engineering Pvt Ltd | `OEM Authorization` | `NOT_APPLICABLE` | N/A | OEM Authorization not required for this tender. |
| 36 | `2026_EIL_915736_1` | `B009` | Meridian Engineering Pvt Ltd | `Debarment Status` | `NON_COMPLIANT` | **HIGH / CRIT** | Appears in debarment registry; ineligible to be awarded tender. |
| 37 | `2026_EIL_912228_1` | `B010` | National Process Equipment Pvt Ltd | `GST` | `INCOMPLETE` | **HIGH** | GST certificate omitted Trade Name, Reg Date, Address; status incomplete. |
| 38 | `2026_EIL_912228_1` | `B010` | National Process Equipment Pvt Ltd | `Udyam/MSME` | `NOT_APPLICABLE` | N/A | Udyam not required for this tender. |
| 39 | `2026_EIL_912228_1` | `B010` | National Process Equipment Pvt Ltd | `OEM Authorization` | `NOT_APPLICABLE` | N/A | OEM Authorization not required for this tender. |
| 40 | `2026_EIL_912228_1` | `B010` | National Process Equipment Pvt Ltd | `Debarment Status` | `COMPLIANT` | **LOW** | Not in debarment registry. |

---

## SECTION 6: EXTRACTION EVIDENCE & AUDIT TRAIL (07_EVIDENCE/)

- **File**: `DATASET/07_EVIDENCE/evidence.csv`
- **Total Rows**: 149 granular evidence entries
- **Purpose**: Provides a traceable citation ledger connecting every field extracted by the LLM/OCR from submitted documents directly to its corresponding registry verification result.

### Schema:
1. `evidence_id`: String (e.g. `EVID_B001_GST_DOCUMENT`, `EVID_B001_GST_REGISTRY`, `EVID_B001_OEM_DOCUMENT`)
2. `tender_id`: String (`2026_EIL_909232_1`, `2026_EIL_915736_1`, `2026_EIL_912228_1`)
3. `bidder_id`: String (`B001` through `B010`)
4. `document_type`: String (`GST`, `GST_REGISTRY`, `UDYAM`, `UDYAM_REGISTRY`, `OEM`, `OEM_REGISTRY`, `DEBARMENT_REGISTRY`)
5. `document_name`: String (e.g. `gst_certificate.pdf`, `gst_registry.csv`, `udyam_certificate.pdf`)
6. `field`: Extracted key (e.g. `GSTIN`, `Legal Name`, `Udyam Number`, `Authorized Bidder`, `Valid Until`, `Registry Status`)
7. `extracted_value`: Text value parsed from document or queried from registry
8. `source_page`: Integer page number (always `1` for synthetic certificates, null for registry queries)
9. `confidence`: Float between `0.95` and `0.99`
10. `notes`: Contextual auditor note explaining extraction source or verification result

### Sample Evidence Trace (for Bidder B001):
```csv
EVID_B001_GST_DOCUMENT,2026_EIL_909232_1,B001,GST,gst_certificate.pdf,GSTIN,99AA01B1234C1Z1,1,0.99,Extracted from bidder-submitted GST certificate
EVID_B001_GST_DOCUMENT,2026_EIL_909232_1,B001,GST,gst_certificate.pdf,Legal Name,Bharat Industrial Systems Pvt Ltd,1,0.99,Extracted from bidder-submitted GST certificate
EVID_B001_GST_REGISTRY,2026_EIL_909232_1,B001,GST_REGISTRY,gst_registry.csv,Registry Legal Name,Bharat Industrial Systems Pvt Ltd,,0.95,Synthetic mock GST registry verification result
EVID_B001_GST_REGISTRY,2026_EIL_909232_1,B001,GST_REGISTRY,gst_registry.csv,Registry Status,ACTIVE,,0.95,Synthetic mock GST registry verification result
EVID_B001_OEM_DOCUMENT,2026_EIL_909232_1,B001,OEM,oem_authorization.pdf,Valid Until,31-12-2027,1,0.98,Extracted from bidder-submitted OEM authorization letter
EVID_B001_OEM_REGISTRY,2026_EIL_909232_1,B001,OEM_REGISTRY,oem_registry.csv,Registry Status,ACTIVE,,0.95,Synthetic mock OEM registry verification result
EVID_B001_DEBARMENT_REGISTRY,2026_EIL_909232_1,B001,DEBARMENT_REGISTRY,debarment_registry_synthetic.csv,Debarment Status,NOT_DEBARRED,,0.95,Bidder not found in synthetic debarment registry
```

---

## SECTION 7: CODEBASE INTEGRATION ARCHITECTURE

This section explains how the GeMStones backend and frontend can directly integrate this dataset without any guesswork:

### 7.1 Database Seeder Integration (`backend/services/seeder.py`)
- Replace the preliminary 6 bidders with the 10 standardized bidders (`B001` to `B010`):
  - Ingest `bidder_id`, `company_name`, `gstin` (`99AA01...`), `udyam_reg_number` (`UDYAM-XX-00-00000X`), and `gem_seller_id` (`GEM-SELLER-B001` through `GEM-SELLER-B010`).
  - Pre-populate baseline risk tiers according to `GROUND_TRUTH.csv`:
    - `B001`, `B002`: `LOW` (Score: 98.0, Status: `VERIFIED`)
    - `B006`, `B007`: `MEDIUM` (Score: 72.0, Status: `FLAGGED`)
    - `B003`, `B004`, `B005`, `B008`, `B009`, `B010`: `HIGH` / `CRITICAL` (Score: 15.0 - 45.0, Status: `FLAGGED` or `REJECTED`)

### 7.2 Mock Portals Integration (`backend/services/mock_portals.py`)
- Update mock portal functions (`query_gstn_portal`, `query_udyam_portal`, `check_gem_watchlist`) to load records directly from:
  - `DATASET/05_MOCK_REGISTRIES/gst_registry.csv`
  - `DATASET/05_MOCK_REGISTRIES/udyam_registry.csv`
  - `DATASET/05_MOCK_REGISTRIES/oem_registry.csv`
  - `DATASET/04_REGISTRIES/debarment_registry_synthetic.csv`
- Add an explicit new simulation check: `query_oem_portal(auth_number, oem_name, bidder_name)` to verify OEM authorizations against `oem_registry.csv`.

### 7.3 Compliance Engine Integration (`backend/services/compliance_engine.py`)
- Add Tender Context to verification:
  - When evaluating bidder against a specific tender (e.g. `2026_EIL_909232_1`), check which requirements are mandatory in that tender (`OEM_AUTHORIZATION` vs `UDYAM` vs `GST`).
  - Flag requirements not listed in the tender as `NOT_APPLICABLE`.
  - Check for debarment first (Rule 151 GFR) — instant `CRITICAL` risk if found in `debarment_registry_synthetic.csv`.
  - Validate certificate validity dates against the current date (`2026-09-11`). Catch expired OEM authorization on `B003`.
  - Compare extracted legal name against bidder name. Catch `B006` ("Precision Pumping Systems" vs "Precision Pumps India") and `B007` ("Assam Industrial Product Works" vs "Assam Industrial Products").
  - Compare OEM authorized entity name against bidder name. Catch `B008` ("Delta Process Engineering" vs "Delta Process Systems").

### 7.4 Live Demo Flow for Judges
1. **Document Auditor Tab**:
   - User uploads `DATASET/03_BIDDER_DOCUMENTS/B003/OEM/oem_authorization.pdf`.
   - Gemini 3.7 Flash extracts `Valid Until: 31-12-2024 (EXPIRED)`.
   - System flags: ⚠️ *Expired Authorization detected under GFR Rule 144*.
2. **Registry Discrepancy Tab**:
   - User inspects `B004` (Nova Engineering). Document PDF claims `Status: ACTIVE`, but GSTN live query returns `INVALID`.
   - System flags: 🚨 *Statutory Fraud Alert — Fake GST Certificate detected*.
3. **Blacklist Tab**:
   - User inspects `B009` (Meridian Engineering).
   - System flags: 🛑 *Debarred Bidder — Prohibited under DoE OM 2021 & GFR Rule 151*.

---
# END OF DATASET MANIFEST
