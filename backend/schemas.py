from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str 
    mobile: str
    
    # Optional fields (Agar registration ke waqt mangni hain)
    birth_day: Optional[int] = Field(None, ge=1, le=31)
    birth_month: Optional[int] = Field(None, ge=1, le=12)
    birth_year: Optional[int] = Field(None, ge=1900, le=2026)
    gender: Optional[str] = None
    role: Optional[str] = "candidate"
    register_as_company: Optional[bool] = False
    company_name: Optional[str] = None
    country: Optional[str] = None
    tax_id: Optional[str] = None
    registration_number: Optional[str] = None
    imageurl: Optional[str] = None

class VerifyID(BaseModel):
    # Id card verification ke liye keys
    mobile: str
    id_card_number: str