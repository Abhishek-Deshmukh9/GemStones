import re
import json
import logging
from typing import Dict, Any, Optional
from ..config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Official Regex Patterns for Indian Government Documents
GSTIN_REGEX = r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b"
PAN_REGEX = r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b"
CIN_REGEX = r"\b[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}\b"
UDYAM_REGEX = r"\bUDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}\b"
DATE_REGEX = r"\b(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.](19|20)\d\d\b"

def fallback_regex_extractor(text: str) -> Dict[str, Any]:
    """
    Deterministic rule-based extractor using official Indian statutory regex patterns.
    Ensures the platform functions seamlessly even without an active Gemini API key.
    """
    extracted: Dict[str, Any] = {
        "gstin": None,
        "pan": None,
        "cin": None,
        "udyam_reg_number": None,
        "legal_name": None,
        "trade_name": None,
        "registration_date": None,
        "detected_doc_type": "UNKNOWN",
        "method": "REGEX_RULE_ENGINE"
    }

    # Match GSTIN
    gstin_match = re.search(GSTIN_REGEX, text)
    if gstin_match:
        extracted["gstin"] = gstin_match.group(0)
        # In Indian GST, characters 3-12 of GSTIN are the PAN
        extracted["pan"] = extracted["gstin"][2:12]
        extracted["detected_doc_type"] = "GST_REG_06"

    # Match PAN if not already extracted
    if not extracted["pan"]:
        pan_match = re.search(PAN_REGEX, text)
        if pan_match:
            extracted["pan"] = pan_match.group(0)
            if not extracted["detected_doc_type"] or extracted["detected_doc_type"] == "UNKNOWN":
                extracted["detected_doc_type"] = "PAN_CARD"

    # Match CIN
    cin_match = re.search(CIN_REGEX, text)
    if cin_match:
        extracted["cin"] = cin_match.group(0)
        extracted["detected_doc_type"] = "MCA_COI"

    # Match Udyam URN
    udyam_match = re.search(UDYAM_REGEX, text)
    if udyam_match:
        extracted["udyam_reg_number"] = udyam_match.group(0)
        extracted["detected_doc_type"] = "UDYAM_CERT"

    # Match Dates
    dates = re.findall(DATE_REGEX, text)
    if dates:
        extracted["registration_date"] = "/".join(dates[0])

    return extracted

async def extract_document_data(text_content: str, doc_type_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Extracts structured statutory data from government certificates.
    Uses Gemini 3.7 Flash if GEMINI_API_KEY is available; falls back to regex parser.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        logger.info("GEMINI_API_KEY not configured. Using deterministic regex extractor.")
        extracted = fallback_regex_extractor(text_content)
        return {
            "model_used": "RuleEngine-Regex-v1",
            "confidence": 0.88,
            "data": extracted
        }

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        prompt = f"""
You are an expert Indian Government Procurement & Statutory Document Auditor.
Extract the key identifiers and statutory information from this scanned certificate text.

Target document type hint: {doc_type_hint or 'Auto-detect'}

Document Text:
\"\"\"
{text_content[:4000]}
\"\"\"

Return ONLY a valid JSON object with the following keys:
{{
  "doc_type": "GST_REG_06" | "UDYAM_CERT" | "MCA_COI" | "PAN_CARD" | "OTHER",
  "gstin": string or null,
  "pan": string or null,
  "cin": string or null,
  "udyam_reg_number": string or null,
  "legal_name": string or null,
  "trade_name": string or null,
  "registered_address": string or null,
  "date_of_registration": string or null,
  "constitution_of_business": string or null,
  "tampering_indicators": string or null,
  "confidence_score": float (0.0 to 1.0)
}}
"""
        response = await client.aio.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=prompt,
        )
        
        raw_text = response.text.strip()
        # Clean JSON markdown fences if returned
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        
        parsed = json.loads(raw_text.strip())
        return {
            "model_used": "gemini-3.5-flash-lite",
            "confidence": parsed.get("confidence_score", 0.95),
            "data": parsed
        }
    except Exception as e:
        logger.warning(f"Gemini extraction encountered error ({str(e)}). Falling back to regex parser.")
        extracted = fallback_regex_extractor(text_content)
        return {
            "model_used": "RuleEngine-Regex-v1 (Fallback)",
            "confidence": 0.85,
            "data": extracted,
            "note": f"Fallback invoked due to: {str(e)}"
        }

async def generate_ai_recommendation(company_name: str, checks_summary: Dict[str, Any], score: float, risk_level: str) -> str:
    """
    Generates a professional recommendation for the procurement officer.
    Uses Gemini if available, else falls back to rule-based engine.
    """
    passed_count = checks_summary.get("checks_passed", 0)
    failed_count = checks_summary.get("checks_failed", 0)
    total_checks = checks_summary.get("checks_total", 0)
    
    fallback_text = (
        f"Based on statutory cross-verification, {company_name} has passed {passed_count} out of {total_checks} "
        f"applicable compliance checks with a score of {score}/100. "
    )
    if risk_level in ["LOW", "MEDIUM"]:
        fallback_text += "No critical discrepancies were detected across the registries. Recommendation: APPROVE for GeM tender participation."
    elif risk_level == "HIGH":
        fallback_text += "Significant discrepancies were found. Recommendation: FLAG for physical vigilance."
    else:
        fallback_text += "Critical failure (e.g., debarment) detected. Recommendation: REJECT and debar bidder."

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return fallback_text
        
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""
You are an expert Indian Government Procurement Officer.
Write a concise, 3-4 sentence professional recommendation for the bidder '{company_name}'.
They received a compliance score of {score}/100 (Risk Level: {risk_level}).
Passed checks: {passed_count}/{total_checks}. Failed/Warning checks: {failed_count}.

State the facts, reference the statutory checks briefly, and provide a clear recommendation (Approve, Flag, or Reject).
Do not use markdown formatting.
"""
        response = await client.aio.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=prompt,
        )
        if response and response.text:
            return response.text.strip()
    except Exception as e:
        logger.warning(f"Gemini recommendation encountered error ({str(e)}). Falling back.")
    
    return fallback_text
