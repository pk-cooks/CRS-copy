from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel
from typing import Optional
import os
import random
import time

app = FastAPI(title="CRS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use absolute path based on script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

# ── Firebase Admin SDK (optional – only if serviceAccountKey.json is present) ──
_firebase_admin_available = False
try:
    import firebase_admin
    from firebase_admin import credentials, auth as firebase_auth

    service_account_path = os.path.join(BASE_DIR, "serviceAccountKey.json")
    if os.path.isfile(service_account_path):
        _cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(_cred)
        _firebase_admin_available = True
        print("✅ Firebase Admin SDK initialized – passwords will be synced to Firebase Auth.")
    else:
        print("⚠️  No serviceAccountKey.json found – password resets will only update the local in-memory DB.")
except ImportError:
    print("⚠️  firebase-admin not installed – password resets will only update the local in-memory DB.")

# Load data only if files exist (dataset can be added later)
courses = pd.DataFrame()

try:
    course_file = os.path.join(DATA_DIR, "course.csv")

    if os.path.isfile(course_file):
        courses = pd.read_csv(course_file)
        courses.columns = courses.columns.str.strip()
        print("DATASET COLUMNS:", courses.columns.tolist())

        if "lvl of diff" in courses.columns:
            courses = courses.rename(columns={"lvl of diff": "level"})

except Exception as e:
    print(f"Warning: Could not load courses data: {e}")

# In-memory stores
user_profiles: dict[int, dict] = {}
users_db: dict[str, dict] = {}  # email -> { userid, password, name, has_done_onboarding }
_next_userid = 10000

# OTP store: email -> { otp: str, expires_at: float }
_otp_store: dict[str, dict] = {}
OTP_TTL_SECONDS = 300  # 5 minutes

# -----------------------------
# Pydantic Models
# -----------------------------
class EducationRequest(BaseModel):
    userid: int
    education_level: str


class InterestRequest(BaseModel):
    userid: int
    interested_fields: list[str]


class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class OtpRequestModel(BaseModel):
    email: str


class OtpVerifyModel(BaseModel):
    email: str
    otp: str


class ResetPasswordModel(BaseModel):
    email: str
    otp: str
    new_password: str


# -----------------------------
# Auth Routes
# -----------------------------
@app.post("/auth/signup")
def signup(data: SignUpRequest):
    global _next_userid
    email = data.email.strip().lower()
    if not email or not data.password.strip():
        raise HTTPException(status_code=400, detail="Email and password required")
    if email in users_db:
        u = users_db[email]
        return {
            "userid": u["userid"],
            "email": email,
            "name": u["name"],
            "is_new_user": False,
            "has_done_onboarding": u["has_done_onboarding"],
        }
    userid = _next_userid
    _next_userid += 1
    users_db[email] = {
        "userid": userid,
        "password": data.password,
        "name": data.name.strip(),
        "has_done_onboarding": False,
    }
    user_profiles[userid] = {}
    return {
        "userid": userid,
        "email": email,
        "name": users_db[email]["name"],
        "is_new_user": True,
        "has_done_onboarding": False,
    }


@app.post("/auth/login")
def login(data: LoginRequest):
    email = data.email.strip().lower()
    if not email or not data.password.strip():
        raise HTTPException(status_code=400, detail="Email and password required")
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    u = users_db[email]
    if u["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "userid": u["userid"],
        "email": email,
        "name": u["name"],
        "is_new_user": False,
        "has_done_onboarding": u["has_done_onboarding"],
    }


# ── Forgot Password / OTP Flow ─────────────────────────────────────────────────

@app.post("/auth/forgot-password/request-otp")
def request_otp(data: OtpRequestModel):
    """
    Generate a 4-digit OTP and 'send' it (printed to console for now).
    Works for both Firebase users and backend-only users.
    """
    email = data.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    otp = str(random.randint(1000, 9999))
    _otp_store[email] = {"otp": otp, "expires_at": time.time() + OTP_TTL_SECONDS}

    # ── Simulated email: print to console ──
    print(f"\n{'='*50}")
    print(f"📧  OTP for password reset")
    print(f"   Email : {email}")
    print(f"   OTP   : {otp}  (valid for 5 minutes)")
    print(f"{'='*50}\n")

    return {"message": "OTP sent to your email (check the backend console)", "email": email}


@app.post("/auth/forgot-password/verify-otp")
def verify_otp(data: OtpVerifyModel):
    """
    Validate the 4-digit OTP without resetting the password.
    Returns a token-like confirmation for the next step.
    """
    email = data.email.strip().lower()
    entry = _otp_store.get(email)

    if not entry:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")
    if time.time() > entry["expires_at"]:
        del _otp_store[email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one")
    if entry["otp"] != data.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP")

    # Mark as verified (keep entry so reset step can also verify)
    entry["verified"] = True
    return {"message": "OTP verified successfully"}


@app.post("/auth/forgot-password/reset")
def reset_password(data: ResetPasswordModel):
    """
    Reset the password after OTP verification.
    Updates users_db and – if Firebase Admin is configured – Firebase Auth as well.
    """
    email = data.email.strip().lower()
    new_password = data.new_password.strip()

    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Re-verify OTP
    entry = _otp_store.get(email)
    if not entry or not entry.get("verified"):
        raise HTTPException(status_code=400, detail="OTP not verified. Please complete OTP verification first")
    if time.time() > entry["expires_at"]:
        del _otp_store[email]
        raise HTTPException(status_code=400, detail="OTP session expired. Please request a new OTP")

    # Update local db
    if email in users_db:
        users_db[email]["password"] = new_password

    # Update Firebase Auth if admin SDK is available
    if _firebase_admin_available:
        try:
            fb_user = firebase_auth.get_user_by_email(email)
            firebase_auth.update_user(fb_user.uid, password=new_password)
            print(f"✅ Firebase Auth password updated for {email}")
        except Exception as e:
            print(f"⚠️  Could not update Firebase Auth password: {e}")

    # Invalidate OTP
    del _otp_store[email]

    return {"message": "Password reset successfully. You can now log in with your new password."}


# -----------------------------
# Core Routes
# -----------------------------
@app.get("/")
def root():
    return {"status": "FastAPI backend running", "data_loaded": not courses.empty}


@app.get("/courses")
def get_courses():
    if courses.empty:
        return []

    df = courses.copy()

    if "lvl of diff" in df.columns:
        df["level"] = df["lvl of diff"]
    else:
        df["level"] = "Unknown"

    return df.to_dict(orient="records")


@app.get("/recommend")
def recommend_courses(userid: Optional[int] = None):
    try:
        if userid is None:
            if not user_profiles:
                return {"error": "No user interest stored yet"}
            last_user = list(user_profiles.keys())[-1]
            userid = last_user
        if userid not in user_profiles:
            return {"error": "User profile not found"}
        user_data = user_profiles[userid]
        if "interested_fields" not in user_data:
            return {"error": "Interest not set yet"}
        interested_fields = user_data["interested_fields"]
        if not interested_fields or not isinstance(interested_fields, list):
            return {"error": "Invalid interests format"}
        if courses.empty:
            return []

        filter_col = next(
            (col for col in ["Sub-Category", "sub-category", "subcategory", "Category", "category", "Title", "title"]
             if col in courses.columns),
            None
        )
        if filter_col is None:
            return []

        pattern = '|'.join(interested_fields)
        filtered = courses[courses[filter_col].str.contains(pattern, case=False, na=False)]
        if filtered.empty:
            return []

        if "Rating" in filtered.columns:
            filtered = filtered.sort_values(by="Rating", ascending=False)
        filtered = filtered.head(12).copy()

        if "level" not in filtered.columns:
            filtered["level"] = filtered["lvl of diff"] if "lvl of diff" in filtered.columns else "Unknown"

        return filtered.to_dict(orient="records")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.post("/educationLevel")
def set_education_level(data: EducationRequest):
    userid = data.userid
    if userid not in user_profiles:
        user_profiles[userid] = {}
    user_profiles[userid]["education_level"] = data.education_level
    return {
        "message": "Education level saved",
        "userid": userid,
        "education_level": data.education_level,
    }


@app.post("/interest")
def set_interest(data: InterestRequest):
    userid = data.userid
    if userid not in user_profiles:
        user_profiles[userid] = {}
    user_profiles[userid]["interested_fields"] = data.interested_fields
    for u in users_db.values():
        if u["userid"] == userid:
            u["has_done_onboarding"] = True
            break
    return {
        "message": "Interest saved",
        "userid": userid,
        "interested_fields": data.interested_fields,
    }


@app.get("/profile/{userid}")
def get_profile(userid: int):
    return user_profiles.get(userid, {})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
