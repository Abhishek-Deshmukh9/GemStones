import time
import asyncio
import csv
import os
from typing import Dict, Any, Optional
from ..config import MOCK_NETWORK_LATENCY_MS

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "DATASET")

def read_csv_to_dict(filepath: str, key_column: str) -> Dict[str, Dict[str, Any]]:
    result = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if key_column in row:
                    key = row[key_column].strip().upper()
                    result[key] = row
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return result

# Cache variables
_gst_registry = None
_udyam_registry = None
_oem_registry = None
_debarment_registry = None

def get_gst_registry():
    global _gst_registry
    if _gst_registry is None:
        path = os.path.join(DATASET_DIR, "05_MOCK_REGISTRIES", "gst_registry.csv")
        _gst_registry = read_csv_to_dict(path, "gstin")
    return _gst_registry

def get_udyam_registry():
    global _udyam_registry
    if _udyam_registry is None:
        path = os.path.join(DATASET_DIR, "05_MOCK_REGISTRIES", "udyam_registry.csv")
        _udyam_registry = read_csv_to_dict(path, "udyam_number")
    return _udyam_registry

def get_oem_registry():
    global _oem_registry
    if _oem_registry is None:
        path = os.path.join(DATASET_DIR, "05_MOCK_REGISTRIES", "oem_registry.csv")
        _oem_registry = read_csv_to_dict(path, "authorized_bidder")
    return _oem_registry

def get_debarment_registry():
    global _debarment_registry
    if _debarment_registry is None:
        path = os.path.join(DATASET_DIR, "04_REGISTRIES", "debarment_registry_synthetic.csv")
        _debarment_registry = read_csv_to_dict(path, "bidder_name")
    return _debarment_registry

async def query_gstn_portal(gstin: str) -> Dict[str, Any]:
    """Simulate API query to Goods & Services Tax Network (GSTN)."""
    await asyncio.sleep(MOCK_NETWORK_LATENCY_MS / 1000.0)
    registry = get_gst_registry()
    record = registry.get(gstin.upper().strip())
    if record:
        return {"success": True, "source": "GSTN_PORTAL", "data": record}
    return {
        "success": False,
        "source": "GSTN_PORTAL",
        "error": f"GSTIN '{gstin}' not found on GST Common Portal (Invalid or Unregistered)"
    }

async def query_udyam_portal(urn: str) -> Dict[str, Any]:
    """Simulate API query to Ministry of MSME Udyam Portal."""
    await asyncio.sleep(MOCK_NETWORK_LATENCY_MS / 1000.0)
    registry = get_udyam_registry()
    record = registry.get(urn.upper().strip())
    if record:
        return {"success": True, "source": "UDYAM_PORTAL", "data": record}
    return {
        "success": False,
        "source": "UDYAM_PORTAL",
        "error": f"Udyam Registration Number '{urn}' not verified on MSME Udyam directory"
    }

async def query_oem_portal(bidder_name: str) -> Dict[str, Any]:
    """Simulate API query to OEM Authorization Portal."""
    await asyncio.sleep(MOCK_NETWORK_LATENCY_MS / 1000.0)
    registry = get_oem_registry()
    record = registry.get(bidder_name.upper().strip())
    if record:
        return {"success": True, "source": "OEM_PORTAL", "data": record}
    return {
        "success": False,
        "source": "OEM_PORTAL",
        "error": f"No OEM authorization found for bidder '{bidder_name}'"
    }

async def check_debarment_registry(bidder_name: str) -> Dict[str, Any]:
    """Simulate query against GeM Debarment / Watchlist registry."""
    await asyncio.sleep(MOCK_NETWORK_LATENCY_MS / 1000.0)
    registry = get_debarment_registry()
    record = registry.get(bidder_name.upper().strip())
    if record and record.get("debarment_status", "").upper() == "DEBARRED":
        return {"is_debarred": True, "source": "GEM_DEBARMENT_REGISTRY", "details": record}
    return {"is_debarred": False, "source": "GEM_DEBARMENT_REGISTRY"}

# Legacy function for step 6/7 compatibility
async def check_gem_watchlist(seller_id: str, pan: str) -> Dict[str, Any]:
    return {"is_debarred": False, "source": "GEM_DEBARMENT_REGISTRY"}

async def query_mca21_portal(cin: str) -> Dict[str, Any]:
    """Simulate API query to Ministry of Corporate Affairs (MCA21)."""
    await asyncio.sleep(MOCK_NETWORK_LATENCY_MS / 1000.0)
    return {
        "success": False,
        "source": "MCA21_PORTAL",
        "error": f"CIN '{cin}' not found on Ministry of Corporate Affairs master data registry"
    }
