from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, Profile
from pydantic import BaseModel
from typing import Dict, Any, List
import time

app = FastAPI(title="Pace Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProfileCreate(BaseModel):
    id: str
    major: str
    workload_credits: int
    employment_status: str
    schedule_preferences: Dict[str, Any]

class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

@app.get("/")
def read_root():
    return {"message": "Welcome to Pace API"}

@app.post("/profiles/")
def create_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    db_profile = db.query(Profile).filter(Profile.id == profile.id).first()
    if db_profile:
        raise HTTPException(status_code=400, detail="Profile already registered")
    
    new_profile = Profile(
        id=profile.id,
        major=profile.major,
        workload_credits=profile.workload_credits,
        employment_status=profile.employment_status,
        schedule_preferences=profile.schedule_preferences
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@app.post("/chat/")
def pace_pilot_chat(chat: ChatMessage):
    user_msg = chat.message.lower()
    
    if "test" in user_msg or "exam" in user_msg:
        response = "I noticed you mentioned an exam. I'll automatically factor this into tomorrow's Auto-Study schedule!"
    elif "schedule" in user_msg or "pomodoro" in user_msg:
        response = "Your focus garden is waiting. Head over to the Dashboard to grow your asset!"
    else:
        response = f"I'm keeping track. You've sent {len(chat.history)} previous messages this session. How can I help you focus?"
        
    return {"reply": response}

@app.post("/syllabus/extract/")
async def extract_syllabus(file: UploadFile = File(...)):
    time.sleep(1.5) # Simulate Vision LLM processing delay
    
    mock_data = {
        "course_name": "Environmental Engineering 101",
        "exam_dates": ["2026-04-10", "2026-05-15"],
        "project_deadlines": [{"name": "Midterm Paper", "date": "2026-04-01"}],
        "message": f"Successfully extracted mock syllabus data from {file.filename}"
    }
    return mock_data
