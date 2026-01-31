from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import date
from app.config import settings
from app.routes import auth, stores, medicines, upload, customer
from app.database import supabase_admin


# Startup function to clean expired medicines
async def cleanup_expired_medicines():
    """Remove medicines that have passed their expiry date"""
    try:
        today = date.today().isoformat()
        result = supabase_admin.table("medicines").delete().lt("expiry_date", today).execute()
        if result.data:
            print(f"Cleaned up {len(result.data)} expired medicines on startup")
    except Exception as e:
        print(f"Warning: Could not clean expired medicines: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await cleanup_expired_medicines()
    yield
    # Shutdown
    pass


# Create FastAPI app
app = FastAPI(
    title="Emergency Medicine Locator API",
    description="API for finding medicines in nearby stores during emergencies",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(stores.router, prefix="/api")
app.include_router(medicines.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(customer.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Emergency Medicine Locator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "healthy"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Emergency Medicine Locator"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
