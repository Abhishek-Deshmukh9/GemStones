GeM Stones — Registry Dataset

This package contains SYNTHETIC registry data for the GeM Stones MVP.
It is not official government registry data and must not be used for real
procurement decisions.

05_MOCK_REGISTRIES/
- gst_registry.csv: synthetic GST verification records
- udyam_registry.csv: synthetic Udyam/MSME verification records
- oem_registry.csv: synthetic OEM authorization verification records

04_REGISTRIES/
- debarment_registry_synthetic.csv: synthetic debarment/blacklist test data

Intended test cases:
B004 -> GST registry says INVALID
B003 -> OEM authorization is EXPIRED
B006 -> GST document name differs from registry/legal bidder name
B007 -> Udyam document name differs from registry enterprise name
B008 -> OEM registry authorizes a different bidder
B009 -> bidder appears as DEBARRED

B005 and B010 intentionally have missing bidder documents. Their registry
records are retained where applicable so the application can distinguish
"document missing" from "registry record missing".

IMPORTANT:
For a real deployment, replace these synthetic registries with approved
government/GeM/CPPP data sources or authorized APIs. Never treat this test
dataset as live verification.
