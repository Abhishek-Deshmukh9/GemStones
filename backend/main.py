from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .config import CORS_ORIGINS
from .services.seeder import seed_database
from .routers import bidders, verification, documents, audit, tenders

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

# Seed realistic bidders if empty
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title="GeMStones Compliance & Verification API",
    description="Automated AI-powered statutory verification and compliance engine for Government e-Marketplace (GeM)",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(bidders.router)
app.include_router(verification.router)
app.include_router(documents.router)
app.include_router(audit.router)
app.include_router(tenders.router)

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "GeMStones Backend API",
        "version": "1.0.0",
        "mode": "PROTOTYPE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
