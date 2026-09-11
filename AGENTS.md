# AGENTS.md - Context & Conventions for GeMStones AI Agents

## Project Overview
**GeMStones** is an AI-powered Integrated Bid Compliance & Seller Verification Platform for GeM (Government e-Marketplace) procurement. Built for Smart India Hackathon (SIH) 2026.

## Technology Stack
- **Backend**: Python 3.12+ with FastAPI, SQLite (via SQLAlchemy ORM), Pydantic v2
- **Frontend**: React 18+ (Vite), **Vanilla CSS** (strictly NO TailwindCSS unless requested)
- **AI / LLM**: Google Gemini 3.7 Flash (`gemini-3.7-flash`) via `google-genai` Python SDK
- **Document Processing**: PyPDF2, pdfplumber, ReportLab (for generating dummy authentic-looking test PDFs)

## Design System & Aesthetics Guidelines
- **Theme**: Professional Government Light Theme (NO dark mode)
  - App Background: Light Slate (#f8fafc), Card Surfaces: Pure White (#ffffff)
  - Sidebar: Deep Government Navy (#1e3a5f) with white text
  - Top Accent: Indian Tricolor Stripe (Saffron #FF9933, White #FFFFFF, Green #138808)
  - Status: Compliant Green (#16a34a), Warning Amber (#d97706), Danger Red (#dc2626), N/A Gray (#6b7280)
  - Typography: Inter for UI body/headings, JetBrains Mono for Government IDs (GSTIN, PAN, CIN, Udyam)
  - Style: Clean white cards with subtle borders (#e2e8f0), NO glassmorphism, NO blur filters. Professional government portal aesthetic.
  - UI Reference Mockups: See `docs/UI_REFERENCE_DASHBOARD.jpg` and `docs/UI_REFERENCE_BIDDER_DETAIL.jpg`.
  - Full design spec: See implementation plan Phase 2 → Design System section.

## Critical Rules for Agents
1. **NEVER use `browser_subagent`**: Explicitly disabled by user directive.
2. **NEVER use `cd` in terminal**: Always pass working directory in `Cwd`.
3. **Vanilla CSS only**: Write styled modular CSS files, use CSS custom properties in `index.css`.
4. **Pragmatic Government Terminology**:
   - GSTIN: 15-char (State code + PAN + entity + Z + check)
   - Form GST REG-06: Official GST Registration Certificate form
   - PAN: 10-char (e.g. `AABCU9603R`)
   - Udyam Registration (URN): `UDYAM-XX-00-0000000` (MSME Ministry)
   - CIN: 21-char Corporate Identification Number (MCA21)
   - EPFO Establishment Code: `XX/XXX/0000000/000`
   - ESIC Code: 17-digit number
   - GeM Seller ID: `GEM-SELLER-XXXXXX`
   - DPIIT: Startup India recognition number
5. **Fast & Non-blocking Demo**:
   - Platform must run completely standalone on a laptop with local SQLite.
   - External government portals (GSTN, MCA21, Udyam) are simulated with realistic network latency (400-800ms) and comprehensive mock records.
   - LLM extraction uses Gemini 3.7 Flash when `GEMINI_API_KEY` is provided; falls back gracefully to deterministic rule-based extractor if offline or key is unset.

## Anti-Slop Implementation Discipline (MANDATORY)

These rules exist to prevent cascading damage from AI-assisted implementation. Follow them without exception.

### READ BEFORE WRITE
- **ALWAYS read a file in full before editing it.** Do not assume you know what a file contains from context or memory. Files may have been modified by other agents or manual edits.
- **ALWAYS read import targets before adding imports.** If you're importing `Tender` from `backend/models/tender.py`, read that file first to confirm the class name, its exact import path, and what it exports.

### SCOPE CONTAINMENT
- **Only modify files listed in your current implementation step.** The implementation plan specifies exactly which files each step touches. Do NOT "helpfully" fix things in other files while you're working on a step.
- **Do NOT refactor, rename, or restructure code that is working.** If existing code is ugly but functional, leave it. You are here to add features, not beautify the codebase.
- **Do NOT remove comments, docstrings, or logging** from existing code unless they are factually wrong about the code they describe.
- **Do NOT change function signatures of existing functions** unless the implementation plan explicitly says to. If you need different parameters, create a new function or add optional parameters with defaults.

### VERIFY AFTER EVERY STEP
- **After completing each implementation step, run the backend** (`python -m backend.main` or equivalent) and confirm it starts without import errors or crashes.
- **After modifying any frontend file, run `npm run dev`** and confirm the dev server starts without compilation errors.
- **If a step breaks something, fix ONLY that step's files.** Do not chase the error into other files unless you are 100% certain the error originates there.

### DEPENDENCY HYGIENE
- **Do NOT install new npm or pip packages** unless the implementation plan explicitly lists them. The current `requirements.txt` and `package.json` are sufficient for Phase 2.
- **If you think a new dependency is needed, STOP and ask the user** instead of installing it silently.

### COMMON AI SLOP PATTERNS TO AVOID
- ❌ Rewriting an entire file when only 5 lines need to change.
- ❌ Adding try/except blocks that silently swallow errors (e.g., `except: pass`).
- ❌ Replacing working inline logic with a new utility function "for cleanliness."
- ❌ Changing variable names for "consistency" across files you weren't asked to touch.
- ❌ Adding TODO comments instead of implementing the actual feature.
- ❌ "Fixing" ESLint or linting warnings in files you weren't asked to modify.
- ❌ Importing libraries that aren't installed (e.g., `import pandas` when pandas isn't in requirements.txt).
- ❌ Creating placeholder/stub functions that return hardcoded data instead of implementing real logic.
- ❌ Over-engineering with abstract base classes, factories, or design patterns when a simple function suffices.

### WHEN IN DOUBT
- **If the implementation plan contradicts AGENTS.md**, follow AGENTS.md — it has higher authority.
- **If you encounter an ambiguity** not covered by the plan or AGENTS.md, implement the simplest correct solution and leave a comment explaining your choice.
- **If something is already working, do not touch it.** The plan has an explicit "What NOT to Change" section — respect it.
