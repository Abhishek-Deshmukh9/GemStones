# 🏛️ GeMStones (Gemini-Powered GeM Compliance AI)

> **Smart India Hackathon (SIH) 2026 Prototype**  
> **Problem Statement**: AI-Powered Integrated Bid Compliance & Seller Verification Platform for Government e-Marketplace (GeM)  
> **Stack**: Python FastAPI + SQLite + Google Gemini 3.7 Flash + React (Vite) + Vanilla CSS Design System

---

## 🌟 Overview
**GeMStones** is an intelligent statutory compliance platform for government procurement officers. It solves the critical bottleneck of fraudulent seller onboarding, fake MSME certifications, and statutory tax defaults on GeM by executing real-time simulated cross-portal checks (GSTN, MCA21, Udyam MSME, EPFO, ESIC) paired with LLM-powered document extraction.

---

## 🚀 Quickstart: Running on Your Laptop (Teammate Guide)

Follow this guide to get GeMStones running on your machine in under **3 minutes**. No external databases (PostgreSQL/MySQL), Docker, or paid API keys are required — everything runs locally with SQLite and high-fidelity simulated government registries!

### 📋 Prerequisites
Make sure your laptop has:
1. **Python 3.12+** ([Download Python](https://www.python.org/downloads/)) — *Windows users: check "Add python.exe to PATH" during installation.*
2. **Node.js 18+ & npm** ([Download Node.js](https://nodejs.org/))
3. **Git** ([Download Git](https://git-scm.com/))

---

### Step 1: Clone the Repository & Configure Environment

```bash
# 1. Clone the repository
git clone <YOUR-GITHUB-REPO-URL>
cd GemStones

# 2. Copy the environment file template
# On Windows (PowerShell):
Copy-Item .env.example .env
# On Mac / Linux / Git Bash:
cp .env.example .env
```

> [!IMPORTANT]
> **🤖 Setting up Your Gemini API Key (CRITICAL FOR HACKATHON DEMO):**  
> GeMStones is an **AI-powered platform**. Google Gemini is the core GenAI intelligence engine across the application:
> 1. **When you click "Verify" or "Run Batch Verification"**: The system queries the simulated government portals (GSTN, MCA21, Udyam, OEM, Debarment), calculates penalties, and then **calls Google Gemini**. Gemini analyzes the multi-portal statutory evidence as an AI Procurement Expert and generates a **live, natural-language Executive Statutory Evaluation & Recommendation** for each bidder (visible in the Bidder Detail view!).
> 2. **When you use the Document Auditor**: **Google Gemini Multimodal LLM** analyzes uploaded PDF certificates (Form GST REG-06, Udyam MSME, OEM Letters) to extract statutory registration IDs, legal names, and forensic layout authenticity.
> 
> 👉 **Get your free key in 30 seconds**: [Google AI Studio](https://aistudio.google.com/apikey)  
> Open `.env` and set:
> ```env
> GEMINI_API_KEY="AIzaSy..."
> ```
> *(Note: A deterministic fallback engine is included strictly as an offline safety net so the app won't crash if hackathon venue Wi-Fi drops, but having `GEMINI_API_KEY` set is essential to showcase the live Generative AI evaluation to the judges!)*

---

### Step 2: Start the Backend Server (Terminal 1)

Open your first terminal window in the `GemStones` project root:

#### On Windows (PowerShell):
```powershell
# (Recommended) Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# If you get a PowerShell ExecutionPolicy error, run:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Install backend dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server (auto-initializes SQLite database & seed data)
uvicorn backend.main:app --reload --port 8000
# Alternatively: python -m backend.main
```

#### On macOS / Linux:
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server
uvicorn backend.main:app --reload --port 8000
```

**Verify Backend is Running:**
- API Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step 3: Start the Frontend UI (Terminal 2)

Open a **second terminal window** and run:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules (first time only)
npm install

# Start the Vite development server
npm run dev
```

**Open the App in Your Browser:**
👉 **[http://localhost:5173](http://localhost:5173)**

You will see the **GeMStones Executive Dashboard** with 10 enrolled bidders awaiting verification. Click **"Run Batch Verification"** to start the demo!

---

### 🛠️ Common Troubleshooting for Teammates

| Issue | Solution |
| :--- | :--- |
| **PowerShell script execution disabled** | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell, or activate `venv\Scripts\activate.bat` in CMD. |
| **Port 8000 or 5173 already in use** | Ensure another instance of Python/Uvicorn or Vite isn't running in another terminal. On Windows: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force`. |
| **Need to reset database to initial state** | Simply delete `gemstones.db` from the root folder and restart the backend, or click **"Reset Verification"** on the Dashboard UI. |
| **`python` command not found** | Try `python3` or `py`. Ensure Python was added to your System PATH during installation. |


---

## 📚 Project Documentation & Deep Guides

All comprehensive documentation is grouped in the [`docs/`](./docs/) directory:

| Document | Audience | Description |
| :--- | :--- | :--- |
| [**APPLICATION_GUIDE.md**](./docs/APPLICATION_GUIDE.md) | Teammates, Officers, Evaluators | **Plain-English Handbook**: Explains what GeMStones does from scratch, tender procurement lifecycle, bidders, government statutory IDs (GSTIN, Udyam, CIN), and step-by-step user journey. |
| [**PROJECT_IMPLEMENTATION_SUMMARY.md**](./docs/PROJECT_IMPLEMENTATION_SUMMARY.md) | AI Agents, Developers, Evaluators | **Deep Technical Context**: Complete technical specification of all backend modules, scoring algorithms, database models, frontend components, simulated registries, and seed state. |
| [**SCHEMA.md**](./docs/SCHEMA.md) | Developers & Data Engineers | Database table schemas, SQLite column definitions, and Pydantic v2 payload contracts. |
| [**DATASET_ANALYSIS.md**](./docs/DATASET_ANALYSIS.md) | Data Engineers & Judges | In-depth breakdown of SIH 2026 EIL tender datasets and ground-truth validation labels. |
| [**TEAM_SETUP_GUIDE.md**](./docs/TEAM_SETUP_GUIDE.md) | Hackathon Team | Team roles, Git collaboration rules, and rapid development workflow. |
| [**PS.txt**](./docs/PS.txt) | Everyone | Official SIH 2026 Problem Statement text. |

---

## 🏗️ Project Architecture

```
GemStones/
├── backend/
│   ├── main.py               # FastAPI entrypoint & router registry
│   ├── config.py             # Environment configurations
│   ├── database.py           # SQLite SQLAlchemy engine & session dependency
│   ├── schemas.py            # Pydantic v2 request/response models
│   ├── models/               # SQLAlchemy ORM models (Bidder, Check, Document, Audit, Tender)
│   ├── routers/              # API endpoints (bidders, verification, documents, audit, tenders)
│   ├── services/
│   │   ├── mock_portals.py      # High-fidelity simulated GSTN, MCA21, Udyam portals
│   │   ├── compliance_engine.py # Statutory scoring, penalty & risk classification engine
│   │   ├── gemini_extractor.py  # Gemini Flash (with lite rate-limit handling) + regex fallback parser
│   │   └── seeder.py            # Pre-seeded realistic bidder profiles (10 personas)
│   ├── generate_samples.py   # ReportLab script generating authentic-looking test PDFs
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/          # Sidebar, Header, Navigation
│   │   │   ├── Dashboard/       # Executive stats, score charts, quick review table
│   │   │   ├── Bidders/         # Bidder directory, details, portal checks inspection
│   │   │   ├── Upload/          # Certificate drag-and-drop & AI extraction view
│   │   │   └── Audit/           # Tamper-proof audit logs ledger
│   │   ├── utils/api.js         # Centralized API fetch wrapper
│   │   ├── index.css            # Custom Vanilla CSS design tokens & government theme
│   │   ├── App.jsx              # Main view controller
│   │   └── main.jsx             # React DOM root
│   ├── vite.config.js           # Vite config with backend proxy
│   └── package.json
│
├── docs/                        # Grouped project documentation, guides, and mockups
│   ├── APPLICATION_GUIDE.md     # Non-technical conceptual handbook
│   ├── PROJECT_IMPLEMENTATION_SUMMARY.md # Deep technical context for agents & devs
│   ├── SCHEMA.md                # Database & payload schema reference
│   ├── DATASET_ANALYSIS.md      # EIL tender dataset breakdown
│   ├── TEAM_SETUP_GUIDE.md      # Team collaboration guide
│   ├── PS.txt                   # Official SIH 2026 Problem Statement
│   ├── UI_REFERENCE_DASHBOARD.jpg # Design mockup (Dashboard)
│   └── UI_REFERENCE_BIDDER_DETAIL.jpg # Design mockup (Bidder Detail)
│
├── sample_docs/                 # Generated Form GST REG-06 and Udyam test certificates
├── DATASET/                     # SIH 2026 EIL tender data & ground-truth registries
├── .env.example                 # Config template
├── AGENTS.md                    # Antigravity IDE agent conventions
└── README.md                    # Quickstart and project overview
```

---

## 🧪 Live Demo Walkthrough (For SIH Jury)

1. **Executive Dashboard**:
   - Visual overview of enrolled bidders, average compliance score, and flagged high-risk vendors.
   - Click **"Run Batch Verification"** to trigger simulated API cross-checks across all government portals. This invokes **Google Gemini** to dynamically evaluate the evidence and generate an **Executive AI Assessment & Recommendation** for each bidder.

2. **Bidder Directory & GenAI Evaluation Inspection**:
   - Click into **Apex Infotech** (98.5% Score, Low Risk) — inspect the **Automated Statutory Evaluation Report** generated by Gemini recommending approval.
   - Click into **Bharat Agro Supplies** (58.0% Score, High Risk) — see Gemini's clear warning regarding overdue GST returns and recommendation to flag for vigilance.
   - Click into **Kavach Defense Gear** (12.0% Score, Critical Risk) — see Gemini's immediate debarment recommendation citing the cancelled GST and GeM Vigilance Watchlist match.

3. **Statutory Document Auditor (Multimodal GenAI Extractor)**:
   - Go to the **Document Auditor** tab.
   - Upload any test certificate from `sample_docs/` (e.g. `gst_reg_06_apex_infotech.pdf`).
   - Watch **Google Gemini** parse the unstructured PDF certificate, extract statutory registration numbers, legal entity name, validity dates, and perform forensic verification of document authenticity.

4. **Nodal Officer Action & Audit Ledger**:
   - In the Bidder view, review the AI findings, enter officer justification notes, and click **"Approve"**, **"Flag for Physical Vigilance"**, or **"Reject & Debar"**.
   - Navigate to the **Audit Trail** tab to see the immutable chronological record of the officer's decision linked to the AI evaluation.

---

## 🤝 Team Collaboration Workflow
- Backend changes: work in `backend/`
- UI / Frontend: work in `frontend/src/`
- Test documents: place in `sample_docs/`
- Every commit can be pulled and run immediately with zero external database setup!
