# GeM-VerifyAI Prototype — Team Setup Guide
### Git + GitHub + Antigravity/Claude Code, spelled out step by step for 6 people

Follow this top to bottom, in order. Steps marked **[ONE PERSON]** are done once by whoever is repo owner. Steps marked **[EVERYONE]** are done by each of the 6 people on their own machine.

Problem statement: AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

• Background Government procurement through the Government e-Marketplace (GeM) involves verification of multiple statutory, regulatory and eligibility requirements of bidders.

Procurement officers are required to examine and validate documents and information related to Udyam/MSME registration, GST registration and return filing, PAN and Income Tax compliance, Make in India/local content, EPFO/ESIC compliance, Startup India, NSIC, OEM authorization, DigiLocker, blacklisting/debarment and other applicable statutory requirements.

The verification process is largely document-intensive and requires cross-checking information across multiple government portals and databases. This results in significant manual effort, longer tender evaluation time and the possibility of inconsistencies or human errors.

• Description The problem statement envisages development of an AI-powered integrated bid compliance verification platform that can automatically verify the eligibility and compliance status of bidders participating in GeM procurement.

The proposed platform shall integrate with relevant Government portals and databases and retrieve/verify bidder information such as Udyam Registration, GSTN, Income Tax, PAN, MCA21, Startup India, NSIC, EPFO, ESIC, DigiLocker, Make in India, BIS/DPIIT and other applicable sources.

An AI Verification Engine shall analyse the submitted bidder documents and portal-derived information, identify missing or inconsistent information, validate applicable compliance requirements and generate an overall compliance assessment. The system shall provide a Compliance Dashboard displaying the compliance score, risk level, document verification status, pending requirements and AI-generated recommendations. The final decision regarding qualification/disqualification shall remain with the Procurement Officer.

• Expected Solution An AI-enabled integrated platform shall be developed for automated verification of bidder compliance in GeM procurement. The solution shall:

1. Integrate with relevant Government portals/databases for automated verification.

2. Verify Udyam/MSME status and other applicable statutory registrations.

3. Verify GST registration and return filing status.

4. Verify PAN and Income Tax compliance.

5. Check Make in India/local content requirements.

6. Verify EPFO/ESIC compliance wherever applicable.

7. Verify Startup India, NSIC and OEM authorization requirements.

8. Perform DigiLocker/document verification.

9. Identify blacklisting and debarment status.

10.Check other applicable statutory and tender-specific compliance requirements.

11.Use AI to identify missing, inconsistent or non-compliant information.

12. Generate an overall Compliance Score and Risk Level.

13. Provide an AI-generated recommendation to the Procurement Officer.

14.Maintain an auditable record of verification and compliance checks.

The final qualification/disqualification decision shall remain with the Procurement Officer, with the AI system functioning as a decision-support and verification tool.

• Key Capabilities 1. Multi-Portal Integration â€“ Udyam, GSTN, PAN, GEM etc., 2. AI Document Verification â€“ Automated extraction,validation & cross-verification 3. Automated Compliance Engine â€“ Tender-specific eligibility & statutory compliance checks 4. Risk & Compliance Scoring â€“ Overall compliance score with bidder risk classification 5. AI Recommendation Engine â€“ Identifies gaps,discrepancies & recommends compliance status 6. Audit Trail & Dashboard â€“ Centralized verification status,evidence & decision support
• Expected Impact
• 60â€“80% Reduction in Verification Effort
• Faster Tender Evaluation & Award
• Improved Compliance & Transparency
• Reduced Human Errors & Inconsistencies
• Better Bidder Screening & Risk Identification
• Standardized Verification Across CPSEs
• Complete Auditability & Traceability
---

## PART 0 — Roles (decide this first, takes 5 minutes)

Assign a name to each row. Whoever owns Person E also becomes **Integration Lead** (extra responsibility, described in Part 6).

| Person | Module | Folder they own |
|---|---|---|
| A | Multi-Portal Integration (mock APIs) | `/backend/mocks/` |
| B | AI Document Verification (extraction) | `/backend/extraction/` |
| C | Compliance Engine + Scoring | `/backend/compliance/` |
| D | AI Recommendation Engine | `/backend/recommendation/` |
| E | Backend orchestration + Audit DB (**Integration Lead**) | `/backend/api/`, `/backend/db/` |
| F | Dashboard (UI) | `/frontend/` |

Write this table into the repo (Part 2 covers where). This is your contract — nobody edits outside their folder without messaging the owner first.

---

## PART 1 — GitHub repo setup **[ONE PERSON]**

1. Go to github.com → New repository.
   - Name: `gem-verifyai-prototype`
   - Visibility: Private (invite the other 5 as collaborators) or Public, your call.
   - Initialize with a README and a `.gitignore` (choose "Node" template, then we'll append Python entries).
2. Settings → Collaborators → add the other 5 by GitHub username or email.
3. Settings → Branches → set `main` as the default branch. For a hackathon, don't bother with branch protection rules — speed matters more than process here, but **never let anyone push directly-force to `main`**.
4. Create the folder skeleton below and push it as the first commit (see Part 2).

---

## PART 2 — Repo folder structure **[ONE PERSON, then everyone pulls]**

Create exactly this structure and push it before anyone starts coding:

```
gem-verifyai-prototype/
├── AGENTS.md              ← Antigravity reads this automatically
├── CLAUDE.md               ← Claude Code reads this automatically (same content as AGENTS.md)
├── SCHEMA.md                ← the shared bidder_record contract (Part 3)
├── STATUS.md                ← running log, everyone appends after every session (Part 5)
├── ROLES.md                 ← the table from Part 0
├── README.md
├── .gitignore
├── backend/
│   ├── mocks/               ← Person A
│   ├── extraction/          ← Person B
│   ├── compliance/          ← Person C
│   ├── recommendation/      ← Person D
│   ├── api/                 ← Person E
│   └── db/                  ← Person E
└── frontend/                ← Person F
```

Commands to create this (run once, by whoever owns the repo):

```bash
git clone https://github.com/<your-org>/gem-verifyai-prototype.git
cd gem-verifyai-prototype
mkdir -p backend/mocks backend/extraction backend/compliance backend/recommendation backend/api backend/db frontend
touch AGENTS.md CLAUDE.md SCHEMA.md STATUS.md ROLES.md
touch backend/mocks/.gitkeep backend/extraction/.gitkeep backend/compliance/.gitkeep backend/recommendation/.gitkeep backend/api/.gitkeep backend/db/.gitkeep frontend/.gitkeep
git add .
git commit -m "chore: initial repo skeleton"
git push origin main
```

---

## PART 3 — SCHEMA.md content **[ONE PERSON writes this, everyone reviews before coding starts]**

Paste this into `SCHEMA.md`. This is the single most important file in the repo — every module reads or writes this shape and nothing else.

```markdown
# Shared Data Contract — bidder_record

Every module reads and/or writes this JSON shape. Do not invent new top-level
fields without updating this file and telling the team.

{
  "bidder_id": "string",
  "checks": {
    "udyam":         { "status": "verified|mismatch|unverified", "data": {}, "source": "mock_portal" },
    "gst":           { "status": "...", "data": {}, "source": "mock_portal" },
    "pan":           { "status": "...", "data": {}, "source": "mock_portal" },
    "mca21":         { "status": "...", "data": {}, "source": "mock_portal" },
    "epfo_esic":     { "status": "...", "data": {}, "source": "mock_portal" },
    "startup_india": { "status": "...", "data": {}, "source": "mock_portal" },
    "nsic":          { "status": "...", "data": {}, "source": "mock_portal" },
    "oem_auth":      { "status": "...", "data": {}, "source": "mock_portal" },
    "digilocker":    { "status": "...", "data": {}, "source": "mock_portal" },
    "blacklist":     { "status": "...", "data": {}, "source": "mock_portal" }
  },
  "extracted_fields": [
    {
      "field": "string",
      "value": "string",
      "source_document_hash": "string",
      "page": 0,
      "confidence": 0.0,
      "extraction_method": "ocr|llm"
    }
  ],
  "compliance_score": 0,
  "risk_level": "low|medium|high",
  "recommendation": "string",
  "audit_log": [
    { "timestamp": "iso8601", "actor": "string", "action": "string", "old": "string", "new": "string" }
  ]
}

## Ownership by field
- checks.*        → Person A writes, Person C reads
- extracted_fields → Person B writes, Person C reads
- compliance_score, risk_level → Person C writes, Person D + F read
- recommendation  → Person D writes, Person F reads
- audit_log       → Person E writes (appended by API layer on every action)

## API endpoints (Person E owns implementation, everyone else calls these)
- POST /upload            → Person B's extraction pipeline runs, returns extracted_fields
- GET  /bidders/:id       → returns full bidder_record
- POST /bidders/:id/verify → runs mock portal checks (Person A) + compliance engine (Person C) + recommendation (Person D), updates bidder_record
- POST /bidders/:id/override → officer manual override, appends to audit_log
```

Everyone reads this file before writing a single line of code. If you need a field that isn't here, add it to this file **and post in the group chat** before using it — don't just add it locally.

---

## PART 4 — AGENTS.md / CLAUDE.md content **[ONE PERSON writes, everyone uses]**

Paste the same content into both `AGENTS.md` and `CLAUDE.md` (Antigravity reads the former, Claude Code the latter — keeping both identical avoids drift):

```markdown
# Project: GeM-VerifyAI Prototype

You are working on ONE module of a 6-person hackathon prototype. Before doing
anything:

1. Read SCHEMA.md — this is the only data contract. Do not invent new fields.
2. Read STATUS.md — this tells you what other modules currently look like and
   what changed since the last session.
3. Read ROLES.md — this tells you which folder you are allowed to touch.

RULES:
- Only create/edit files inside your assigned folder (see ROLES.md). Never
  edit another person's folder, even to "fix" something — flag it in
  STATUS.md instead.
- Only produce/consume data matching the shapes in SCHEMA.md.
- Keep functions small and the module runnable in isolation with mock data —
  do not assume other modules are finished.
- At the end of the session, append one line to STATUS.md describing what
  changed, in the format specified in that file.
- This is a hackathon prototype: prioritize a working, demoable path over
  edge cases. Mock external government APIs — do not attempt real
  integrations with GSTN/MCA21/Udyam/etc.
```

Every person, at the start of every Antigravity or Claude Code session, should paste in (or the tool should auto-load) something like:

> "Read AGENTS.md, SCHEMA.md, STATUS.md and ROLES.md first. I am Person [X], owner of [folder]. Today's task: [specific task]."

Note the practical difference between the two tools: Claude Code re-reads CLAUDE.md automatically every session and keeps that context persistent, while Antigravity agents start fresh each session — so for Antigravity users, re-stating "read AGENTS.md and STATUS.md first" at the start of every single session is not optional, it's the only way the agent knows what already exists.

---

## PART 5 — STATUS.md content and update protocol **[EVERYONE, every session]**

Paste this starter into `STATUS.md`:

```markdown
# Status Log — append only, newest at the top

Format: [Person] [Date/Time] — one or two lines: what changed, what's still broken/missing.

---
```

**Rule: before you close your editor at the end of any coding session, add one entry.** Example:

```
[Person C] [Day1 14:30] — compliance engine now reads checks.udyam and checks.gst
from bidder_record, applies 3 rules (registry mismatch, expired cert, missing
field), writes compliance_score (basic weighted sum, not final) and risk_level.
Still missing: scoring for the other 8 checks, not wired to recommendation engine yet.
```

This is what lets a fresh Antigravity session (or a teammate) understand the current state of the project without re-reading all the code.

---

## PART 6 — Daily git workflow **[EVERYONE]**

### One-time setup, each person, on their own machine

```bash
git clone https://github.com/<your-org>/gem-verifyai-prototype.git
cd gem-verifyai-prototype
git checkout -b person-<x>-<module>      # e.g. person-c-compliance
```

### Every single work session, in this exact order

```bash
# 1. BEFORE opening your AI agent — sync with the team
git checkout main
git pull origin main
git checkout person-<x>-<module>
git merge main                            # bring in everyone else's latest work

# 2. Open Antigravity / Claude Code, point it at your folder, tell it to
#    read AGENTS.md + SCHEMA.md + STATUS.md first (see Part 4)

# 3. Work. Let the agent generate/edit files ONLY inside your assigned folder.

# 4. BEFORE closing your editor — commit and push
git add backend/<your-folder>/            # never `git add .` — stay inside your folder
git commit -m "compliance: add rule matching for udyam + gst checks"
git push origin person-<x>-<module>

# 5. Open a Pull Request into main on GitHub (even solo hackathons should do
#    this — it's a 10-second sanity check, not bureaucracy)

# 6. Append your line to STATUS.md, commit that too, push again
```

### Merge conflicts

Because everyone stays inside their own folder, real conflicts should be rare. If one happens:
1. Don't let the AI agent auto-resolve it blindly — read the diff yourself first.
2. If it's inside SCHEMA.md, AGENTS.md, STATUS.md, or ROLES.md (the shared files), resolve manually and message the team — these are the only files where two people's work legitimately overlaps.
3. If it's inside someone's assigned folder, that means someone edited outside their lane — stop and ask why before merging.

---

## PART 7 — Integration checkpoints **[Person E / Integration Lead runs these]**

Every 90 minutes to 2 hours, Person E:

```bash
git checkout main
git pull origin main
```

Then merges each open Pull Request one at a time (not all at once), running the app after each merge to catch breakage immediately rather than after 6 merges have piled up. If something breaks, the Integration Lead pings the relevant person before merging the next PR.

At each checkpoint, everyone else briefly checks STATUS.md to see what changed elsewhere and adjusts their next task if a dependency became available (e.g., Person D can only really start once Person C's `compliance_score` output is real, not a stub).

---

## PART 8 — Suggested timeline (adjust to your actual hackathon length)

| Time | Activity |
|---|---|
| Hour 0 | Part 0–4: roles, repo, SCHEMA.md, AGENTS.md agreed and pushed. Nobody codes yet. |
| Hour 0.5–1 | Everyone clones, sets up their branch, confirms their agent can read the shared files. |
| Hour 1–8 | Build against mocks/fixtures in parallel. Integration checkpoint every 2 hrs. |
| Hour 8–10 | First real end-to-end run: upload → mock checks → compliance score → recommendation → dashboard. Expect this to break — that's normal and why you checkpoint. |
| Hour 10–18 | Fix integration breakage, fill in remaining rules/checks, polish UI (Person F gets priority help here since "UI needs to be good" was explicit). |
| Hour 18–20 | Feature freeze. No new features — bug fixes and polish only. |
| Hour 20–22 | Prepare demo script, seed realistic-looking mock bidder data, rehearse the walkthrough. |

---

## PART 9 — Quick git command cheat sheet (pin this somewhere visible)

```bash
git status                    # what's changed locally
git pull origin main          # get latest from GitHub
git checkout -b <branch>      # create + switch to a new branch
git add <path>                # stage specific files/folders (avoid `git add .`)
git commit -m "message"       # save a snapshot
git push origin <branch>      # send your branch to GitHub
git merge main                # bring main's changes into your branch
git log --oneline -10         # see recent commit history
```

---

## The one rule that matters more than any of the above

**Stay inside your folder, read the shared files before you start, write one line to STATUS.md before you stop.** Everything else in this guide exists to support that one habit.
