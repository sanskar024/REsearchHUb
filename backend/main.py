from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import auth, papers

# Database tables create karna (agar nahi hui hain)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResearchHub AI API",
    description="Intelligent Research Paper Management and Analysis System",
    version="1.0.0"
)

# Activity 6.3: CORS Configuration
# Production mein yahan apna actual domain dalna (e.g., https://researchhub-ai.vercel.app)
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite ka default port
    "http://127.0.0.1:3000",
    "http://0.0.0.0:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # GET, POST, DELETE, etc. sab allow
    allow_headers=["*"],
)

# Routers Include karna
app.include_router(auth.router)
app.include_router(papers.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "ResearchHub AI API is running",
        "version"   : "1.0.0",
        "agent": "Llama 3.3 70B Active"
    }