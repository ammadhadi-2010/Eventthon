from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserProfile(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: EmailStr
    # ✅ Mobile field set hy
    mobile: Optional[str] = Field(None, description="Unique mobile number") 
    
    birth_day: Optional[int] = Field(None, ge=1, le=31)
    birth_month: Optional[int] = Field(None, ge=1, le=12)
    birth_year: Optional[int] = Field(None, ge=1900, le=2026)
    gender: Optional[str] = None
    
    id_card_verified: bool = False 
    skill_score: float = 0.0
    wallet_balance: float = 0.0 
    skills: List[str] = []
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    language_preference: str = "en"
    
    auth_provider: str = "manual" 
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # ✅ In fields ko class ke andar (Dayaen taraf) hona chahiye
    headline: Optional[str] = None
    niche: Optional[str] = None
    projects: List[dict] = []  
    experience: List[dict] = [] 
    identity_status: str = "Pending Review"

class SquadCreate(BaseModel):
    squad_name: str
    description: str
    niche: str 
    leader_mobile: str
    max_members: int = 5

class Squad(BaseModel):
    squad_id: str
    squad_name: str
    description: str
    niche: str
    leader_mobile: str
    members: List[str] = [] 
    pending_invites: List[str] = [] 
    pending_requests: List[str] = [] 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "Active"

class Transaction(BaseModel):
    sender_mobile: str
    receiver_mobile: str
    amount: float
    transaction_type: str 
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "completed"
    
    # ✅ Model config ko Transaction class ke andar rakha hy
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "first_name": "Ammad",
                "email": "ammad@example.com",
                "mobile": "+923001234567",
                "skill_score": 95.0,
                "wallet_balance": 100.0,
                "auth_provider": "google"
            }
        }
    )