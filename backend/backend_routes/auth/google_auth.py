from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime
import os
from database import user_collection 

router = APIRouter()

# 1. Isay double check karein ke yeh wahi hy jo Google Console mein hy
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

class TokenBody(BaseModel):
    token: str

@router.post("/google-login")
async def google_login(data: TokenBody):
    try:
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=503, detail="Google auth is not configured.")
        # 2. Token Verify karna (clock_skew add kiya hy taake time difference ka error na aaye)
        idinfo = id_token.verify_oauth2_token(
            data.token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10 
        )
        
        email = idinfo.get('email')
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")

        name = idinfo.get('name', 'User')
        picture = idinfo.get('picture')

        # 3. MongoDB mein User check karna
        user = await user_collection.find_one({"email": email})

        if not user:
            # Naya User
            new_user = {
                "first_name": name,
                "last_name": idinfo.get('family_name', ""),
                "email": email,
                "mobile": None,
                "profile_image_url": picture,
                "id_card_verified": False,
                "skill_score": 0.0,
                "wallet_balance": 0.0,
                "skills": [],
                "auth_provider": "google",
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            await user_collection.insert_one(new_user)
            # Response ke liye data set karein
            display_name = name
            display_pic = picture
            print(f"New User Created: {email}")
        else:
            # Purane user ka data update karna
            update_data = {
                "profile_image_url": picture,
                "last_login": datetime.utcnow()
            }
            await user_collection.update_one({"email": email}, {"$set": update_data})
            display_name = user.get("first_name", name)
            display_pic = picture
            print(f"User Logged In: {email}")

        return {
            "status": "success",
            "user": {
                "first_name": display_name,
                "email": email,
                "picture": display_pic
            }
        }
        
    except ValueError as ve:
        print(f"Token Validation Error: {str(ve)}")
        raise HTTPException(status_code=400, detail=f"Invalid Token: {str(ve)}")
    except Exception as e:
        print(f"System Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")