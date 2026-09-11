# 🏛️ GeMStones Application Guide
*The Non-Technical, Complete Handbook for Teammates, Judges & Procurement Officers*

---

## 🌟 Executive Summary: What is GeMStones?

In the Government of India, public procurement worth lakhs of crores passes annually through the **GeM (Government e-Marketplace)** portal. Whenever a government department or Public Sector Undertaking (such as Engineers India Limited or Numaligarh Refinery) needs equipment, IT hardware, or industrial components, they publish a **Tender**. Private vendors, known as **Bidders**, submit their bids along with statutory documents to prove they are legitimate tax-paying businesses and authorized suppliers.

### The Problem Today
Before awarding a government contract, a **Nodal Procurement Officer** must verify whether the bidder is genuine. Currently, this is a slow, manual, error-prone headache:
1. **Disjointed Databases**: The officer must open separate browser tabs for the **GSTN portal** (tax registration), **MCA21** (corporate status), **MSME Udyam** (small business registry), and **Central Debarment / Blacklist registries**.
2. **Fraud & Manipulation**: Fraudulent bidders often upload altered PDFs, submit expired OEM reseller authorization letters, or use shell companies that are debarred for past misconduct.
3. **Information Overload**: A single tender can receive dozens of bids. Manually cross-referencing every registration number against external portals takes days, stalling national projects.

### The GeMStones Solution
**GeMStones** is an AI-powered, automated statutory compliance audit and seller verification platform. It integrates directly into the procurement workflow:
- **Instant Multi-Registry Cross-Verification**: In seconds, the platform cross-checks seller claims against simulated live government registries (GSTN, MCA21, MSME Udyam, GeM Central Watchlist, and OEM Authorization databases).
- **Tender-Context-Aware Evaluation**: The system is smart. It only tests criteria required by the specific tender (for example, if a tender does not require an MSME certificate, a missing Udyam document is marked *Not Applicable* and does not penalize the vendor).
- **Automated Gemini Generative AI Assessments**: Powered by Google Gemini, the platform dynamically acts as an AI Procurement Expert to synthesize multi-portal findings into actionable, plain-English executive recommendations for the nodal officer.
- **Multimodal AI Certificate Auditing**: Google Gemini Vision/Multimodal LLM inspects uploaded statutory PDF certificates (GST REG-06, Udyam, OEM authorizations) for authenticity, metadata consistency, and tampering.
- **Administrative Decision Console & Audit Ledger**: Procurement officers can formally Approve, Flag for Physical Vigilance, or Debar a bidder with immutable timestamped audit logs.

---

## 📚 Core Terminology: From Scratch

If you or your teammates are new to public procurement, here is everything you need to know in simple terms:

### 1. Procurement Fundamentals
| Term | What It Means in Plain English |
| :--- | :--- |
| **GeM** | *Government e-Marketplace* — India's national online portal for government departments to purchase goods and services. |
| **Tender (NIT)** | *Notice Inviting Tender* — A formal solicitation issued by a government authority inviting suppliers to bid for a specific supply or construction project. |
| **Bidder / Seller** | A registered commercial vendor or manufacturing enterprise that submits a bid to win a government tender. |
| **Nodal Officer** | The authorized government procurement manager responsible for inspecting vendor credentials and approving contract awards. |
| **GFR** | *General Financial Rules* — The mandatory public finance and procurement regulations governing all Central Government purchases in India. |
| **Debarment / Blacklist** | A statutory ban (under GFR Rule 151) prohibiting corrupt, fraudulent, or non-performing vendors from participating in government contracts. |

---

### 2. Statutory Identifiers & Government Certificates
Government portals verify businesses through unique registration alphanumeric codes. GeMStones validates all of them:

* **GSTIN (Goods & Services Tax Identification Number)**:
  - **Format**: 15-character code (e.g. `99AA01B1234C1Z1`).
  - **What it verifies**: Active taxpayer status and legal business jurisdiction.
  - **Official Form**: *Form GST REG-06* (Government Certificate of GST Registration).
* **PAN (Permanent Account Number)**:
  - **Format**: 10-character code (e.g. `AA01B1234C`).
  - **What it verifies**: Central Board of Direct Taxes (CBDT) identity. Characters 3–12 of a company's GSTIN match their corporate PAN.
* **CIN (Corporate Identification Number)**:
  - **Format**: 21-character corporate identifier issued by the Ministry of Corporate Affairs (**MCA21**).
  - **What it verifies**: Confirms the business is an actively incorporated Private Limited, Public Limited, or LLP under the Companies Act.
* **Udyam Registration Number (URN)**:
  - **Format**: `UDYAM-XX-00-0000000`.
  - **What it verifies**: Validates small business recognition from the Ministry of Micro, Small & Medium Enterprises (**MSME**). Eligible MSMEs receive tender fee waivers and purchase preferences.
* **OEM Authorization Letter**:
  - **What it verifies**: Original Equipment Manufacturer authorization. Proves that a reseller has an active, unexpired agreement with the primary manufacturer to sell certified industrial goods.

---

### 3. Compliance Scores & Risk Tiers
Every bidder evaluated by GeMStones receives a mathematical compliance score out of **100.0**:

| Risk Tier | Score Range | Meaning & Required Action | UI Color |
| :--- | :---: | :--- | :---: |
| **PENDING** | `-- / 100` | Bid has been staged into the system but has **not yet been verified** against statutory registries. | **Neutral Slate** |
| **LOW** | `85.0 – 100.0%` | **Fully Compliant**. Zero statutory discrepancies. Valid for contract award. | **Emerald Green** |
| **MEDIUM** | `65.0 – 84.9%` | **Discrepancy / Minor Warning**. For example, a legal name spelling variance between the bid form and the registry. | **Amber Orange** |
| **HIGH** | `40.0 – 64.9%` | **Severe Non-Compliance**. Expired OEM authorization, invalid GSTIN, or missing mandatory statutory certificate. | **Deep Orange / Red** |
| **CRITICAL** | `0.0 – 39.9%` | **Disqualified / Blacklisted**. Detected on the Central Debarment Watchlist. Immediate rejection required by law. | **Crimson Red** |

---

## 🎯 The 10 Seeded Bidders & Their Ground-Truth Defects

The platform is seeded with 10 authentic-feeling Indian manufacturing enterprises. Each vendor was designed with specific statutory profiles based on real-world public procurement test scenarios:

| # | Bidder Name | Seller ID | Assigned Tender | Status After Verification | Ground-Truth Statutory Scenario |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **1** | **Bharat Industrial Systems Pvt Ltd** | `B001` | *Bina Petchem Project* | **LOW (100%)** | **Flawless Baseline**: Valid, active OEM authorization and clean debarment record. |
| **2** | **Eastern Process Equipment Pvt Ltd** | `B002` | *Numaligarh Polypropylene* | **LOW (100%)** | **Flawless MSME**: Active Udyam MSME certificate matching registry, not debarred. |
| **3** | **Apex Flow Technologies Pvt Ltd** | `B003` | *Bina Petchem Project* | **HIGH (50%)** | **Expired OEM Letter**: OEM authorization expired on 31-12-2024. |
| **4** | **Nova Engineering Solutions Pvt Ltd** | `B004` | *PLL Water Monitor* | **HIGH (50%)** | **Invalid GSTIN**: Submitted certificate looks real, but GSTN registry returns `STATUS: INVALID`. |
| **5** | **Shakti Mechanical Works** | `B005` | *Numaligarh Polypropylene* | **HIGH (50%)** | **Missing Mandatory Doc**: Active Udyam record exists in registry, but bidder forgot to attach the certificate. |
| **6** | **Precision Pumps India Pvt Ltd** | `B006` | *PLL Water Monitor* | **MEDIUM (75%)** | **Document Name Mismatch**: Submitted GST certificate reads *"Precision Pumping Systems Pvt Ltd"* instead of the bidding entity name. |
| **7** | **Assam Industrial Products Pvt Ltd** | `B007` | *Numaligarh Polypropylene* | **MEDIUM (75%)** | **Registry Name Mismatch**: Udyam registry lists enterprise as *"Assam Industrial Product Works Pvt Ltd"*. |
| **8** | **Delta Process Systems Pvt Ltd** | `B008` | *Bina Petchem Project* | **HIGH (50%)** | **OEM Authorization Mismatch**: Authorization letter was issued to *"Delta Process Engineering Pvt Ltd"*, not the bidder. |
| **9** | **Meridian Engineering Pvt Ltd** | `B009` | *Numaligarh Polypropylene* | **CRITICAL (0%)** | **Blacklisted Vendor**: Found on the Central Debarment Watchlist for tender rigging. Automatic disqualification. |
| **10**| **National Process Equipment Pvt Ltd** | `B010` | *PLL Water Monitor* | **MEDIUM (75%)** | **Incomplete Certificate**: Submitted Form GST REG-06 omits Trade Name, Registration Date, and Registered Office Address. |

---

## 🖥️ How to Walk Through the Application (Demo Guide)

Follow this sequence for an impactful 5-minute hackathon presentation or team walkthrough:

### Step 1: The Executive Dashboard (`/dashboard`)
- **First Impression**: The portal opens in a clean, professional Government Light Theme with the Indian Tricolor header accent.
- **Unverified State Notice**:
  - Notice the banner tag: `• 10 BIDS AWAITING STATUTORY VERIFICATION`.
  - The **Average Compliance Score** reads `--` with the caption *"Awaiting batch verification"*.
  - The **Pending Verification** card shows `10` staged bids.
  - The central callout invites the officer to execute batch verification.
- **Action**: Click the orange **"Run Batch Verification"** button!
- **What Happens**:
  - The Saffron indeterminate progress bar animates.
  - In seconds, the platform evaluates all 10 bidders across GSTN, MCA21, MSME Udyam, Debarment, and OEM registries.
  - **Google Gemini Generative AI** is invoked to analyze the multi-portal statutory evidence and author an executive recommendation for each vendor.
  - The cards dynamically animate into place: **Average Compliance Score rises to ~65%**, **Fully Verified: 2**, **Flags: 7**, **Critical Debarred: 1**.
  - The **Score Distribution Bar Chart** and **Risk Level Donut Chart** appear live.

### Step 2: The Tender Scope Dashboard (`/verification`)
- Navigate to **Tender Dashboard** on the sidebar.
- You will see 3 realistic tenders issued by **Engineers India Limited (EIL)**.
- Each tender card lists its required statutory checks (e.g. `OEM_AUTHORIZATION`, `UDYAM`, `GST`) and how many bidders are enrolled.
- Click **"Evaluate Bids"** on the *Numaligarh Polypropylene Project* (`2026_EIL_915736_1`).

### Step 3: The Bidder Master Directory (`/bidders`)
- The left column filters down to the 4 bidders competing for this specific tender (`Eastern Process`, `Shakti Mechanical`, `Assam Industrial`, `Meridian Engineering`).
- Use the **Filter Tabs** at the top (`All`, `Pending`, `Verified`, `Flagged`, `Rejected`) to quickly segment vendors.
- Click on **Meridian Engineering Pvt Ltd**:
  - Notice the animated SVG gauge drops to **`0 / 100` (CRITICAL)**.
  - The portal check warns in bright red: `⚠ CRITICAL: Bidder is currently debarred (Reason: Rigging & Statutory Non-Performance)`.
  - The **Google Gemini AI Compliance Recommendation** explicitly instructs: *"Reject the bid submitted by Meridian Engineering Pvt Ltd and debar from future participation."*
  - In the **Nodal Officer Decision Console**, enter remarks and click **"Reject Bidder"**. A sliding crimson toast notification confirms the decision and logs it into the audit trail.
- Click on **Eastern Process Equipment Pvt Ltd**:
  - Gauge climbs to **`100 / 100` (LOW RISK)**.
  - All statutory checks are green.
  - Read Gemini's clean recommendation approving the vendor.
  - Click **"Approve Bidder for Tender"**. A green toast confirms approval.

### Step 4: Statutory Document Ingestion & Multimodal AI Extractor (`/upload`)
- Navigate to **Document Auditor (AI)** on the sidebar.
- Drag and drop a sample certificate from the `sample_docs/` folder (or select Form GST REG-06).
- Click **"Run Statutory Extraction"**.
- Watch **Google Gemini Multimodal LLM** parse statutory fields, compute confidence scores, and run anti-tampering heuristics on the certificate in real time.

### Step 5: Government Procurement Audit Trail (`/audit`)
- Navigate to **Audit Trail** on the sidebar.
- Inspect the immutable chronological ledger recording every verification run, system check, officer decision, and timestamp for complete statutory transparency.

### Step 6: Resetting for Another Demo Run
- Return to the **Executive Dashboard**.
- Click the **"Reset Demo State"** button in the top banner.
- All 10 bidders instantaneously return to the clean, unverified `PENDING` state with zero database file deletion required!

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Does the app stop working if internet access is lost or Gemini API keys expire?**
> **No.** GeMStones has an automatic zero-downtime architecture. If an active Gemini API key is present, it uses `gemini-3.5-flash-lite` for live AI recommendations. If offline or if the API key is unset, the system falls back seamlessly to a built-in deterministic Indian statutory regex rule engine without throwing any user errors.

**Q: Why do some bidders have scores of 75% while others have 50%?**
> GeMStones applies proportional penalty weighting:
> - **Minor Discrepancy** (-25 points): e.g. Name spelling mismatch or omitted trade name.
> - **Severe Defect** (-50 points): e.g. Expired OEM authorization, invalid GST registration, or missing mandatory certificate.
> - **Blacklist / Debarment** (-100 points): Immediate disqualification (Score 0) per GFR Rule 151.

**Q: Are these government registries real?**
> For the SIH hackathon prototype, external government portals are simulated through realistic CSV datasets (`05_MOCK_REGISTRIES`) with simulated network latency (400–800ms) to ensure the demo runs reliably, offline, and rapidly on any laptop without relying on live government captcha gateways.
