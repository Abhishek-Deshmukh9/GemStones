import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

DOCS_DIR = Path(__file__).resolve().parent.parent / "sample_docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def generate_gst_certificate(filename: str, gstin: str, legal_name: str, trade_name: str, address: str, date: str):
    filepath = DOCS_DIR / filename
    c = canvas.Canvas(str(filepath), pagesize=letter)
    width, height = letter

    # Header Border
    c.setStrokeColor(colors.HexColor("#0c1524"))
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)
    c.rect(35, 35, width - 70, height - 70)

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2.0, height - 80, "Government of India")
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2.0, height - 105, "Form GST REG-06")
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2.0, height - 125, "[See Rule 10(1)]")
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width / 2.0, height - 145, "Registration Certificate")

    # Body Table
    y = height - 190
    c.setFont("Helvetica-Bold", 10)
    
    rows = [
        ("Registration Number (GSTIN):", gstin),
        ("Legal Name:", legal_name),
        ("Trade Name, if any:", trade_name),
        ("Constitution of Business:", "Private Limited Company / LLP"),
        ("Address of Principal Place of Business:", address),
        ("Date of Liability:", date),
        ("Period of Validity:", "From " + date + " To Continuous"),
        ("Type of Registration:", "Regular"),
        ("Particulars of Approving Authority:", "Superintendent, Center/State Tax"),
    ]

    for label, val in rows:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(60, y, label)
        c.setFont("Helvetica", 10)
        c.drawString(270, y, val)
        c.setStrokeColor(colors.HexColor("#e2e8f0"))
        c.setLineWidth(0.5)
        c.line(60, y - 8, width - 60, y - 8)
        y -= 32

    # Footer Notice
    c.setFont("Helvetica-Oblique", 8)
    c.drawCentredString(width / 2.0, 55, "Note: The registration certificate is required to be prominently displayed at all places of business in the State.")
    c.save()
    print(f"Generated sample certificate: {filepath}")

def generate_udyam_certificate(filename: str, urn: str, name: str, cat: str, activity: str, nic: str):
    filepath = DOCS_DIR / filename
    c = canvas.Canvas(str(filepath), pagesize=letter)
    width, height = letter

    c.setStrokeColor(colors.HexColor("#065f46"))
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)

    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(width / 2.0, height - 80, "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES")
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(width / 2.0, height - 105, "UDYAM REGISTRATION CERTIFICATE")

    y = height - 170
    items = [
        ("UDYAM REGISTRATION NUMBER:", urn),
        ("NAME OF ENTERPRISE:", name),
        ("TYPE OF ENTERPRISE:", cat.upper()),
        ("MAJOR ACTIVITY:", activity.upper()),
        ("NATIONAL INDUSTRY CLASSIFICATION (NIC):", nic),
        ("DATE OF UDYAM REGISTRATION:", "12/04/2018")
    ]

    for label, val in items:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(60, y, label)
        c.setFont("Helvetica", 10)
        c.drawString(310, y, val)
        y -= 35

    c.save()
    print(f"Generated sample Udyam certificate: {filepath}")

if __name__ == "__main__":
    generate_gst_certificate(
        "gst_reg_06_apex_infotech.pdf",
        "29AABCB1234A1Z5",
        "Apex Infotech Solutions Pvt Ltd",
        "Apex Cloud Solutions",
        "No. 42, 4th Cross, Electronic City, Bengaluru - 560100",
        "12/04/2018"
    )
    generate_gst_certificate(
        "gst_reg_06_bharat_agro.pdf",
        "27AAACG9876B1Z2",
        "Bharat Agro Supplies LLP",
        "KisanMart Logistics",
        "Gala No 14, APMC Market 2, Vashi, Navi Mumbai - 400703",
        "20/08/2020"
    )
    generate_udyam_certificate(
        "udyam_apex_infotech.pdf",
        "UDYAM-KR-03-0012345",
        "Apex Infotech Solutions Pvt Ltd",
        "Small",
        "Services",
        "6201 - Computer programming and consultancy"
    )
