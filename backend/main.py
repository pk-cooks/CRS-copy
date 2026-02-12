from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from recommender import CourseRecommender
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    #allow_origins=["http://localhost:5173"],
)

DATA = "data/"

courses = pd.read_csv(DATA + "course.csv")
ratings = pd.read_csv(DATA + "rating.csv")

recommender = CourseRecommender(
    DATA + "course.csv",
    DATA + "rating.csv"
)

# -----------------------------
# In-memory user profile store
# -----------------------------
user_profiles = {}

# -----------------------------
# Pydantic Models
# -----------------------------
class EducationRequest(BaseModel):
    userid: int
    education_level: str


class InterestRequest(BaseModel):
    userid: int
    interested_fields: list[str]


# -----------------------------
# Routes
# -----------------------------

@app.get("/")
def root():
    return {"status": "FastAPI backend running"}


@app.get("/courses")
def get_courses():
    return courses.to_dict(orient="records")


@app.get("/history/{userid}")
def get_history(userid: int):
    return ratings[ratings.userid == userid].to_dict(orient="records")


@app.post("/history")
def add_history(item: dict):
    global ratings
    ratings = pd.concat([ratings, pd.DataFrame([item])])
    recommender.ratings = ratings
    recommender._prepare()
    return {"message": "History added"}


class RecommendRequest(BaseModel):
    interested_fields: list[str]


@app.get("/recommend")
def recommend_courses():

    # If no users stored
    if not user_profiles:
        return {"error": "No user interest stored yet"}

    # Get the latest stored user (since you're not using userId)
    last_user = list(user_profiles.keys())[-1]
    user_data = user_profiles[last_user]

    # Check if interest exists
    if "interested_fields" not in user_data:
        return {"error": "Interest not set yet"}

    interested_fields = user_data["interested_fields"]

    # Filter CSV by Sub-Category
    filtered_courses = courses[
        courses["Sub-Category"].isin(interested_fields)
    ]

    # Sort by rating
    filtered_courses = filtered_courses.sort_values(
        by="Rating",
        ascending=False
    )

    return filtered_courses.head(12).to_dict(orient="records")


# -----------------------------
# NEW: Store Education Level
# -----------------------------
@app.post("/educationLevel")
def set_education_level(data: EducationRequest):
    userid = data.userid
    education_level = data.education_level

    if userid not in user_profiles:
        user_profiles[userid] = {}

    user_profiles[userid]["education_level"] = education_level
    print(f"User {userid} set education level to {education_level}")
    return {
        "message": "Education level saved",
        "userid": userid,
        "education_level": education_level
    }
        


# -----------------------------
# NEW: Store Interested Field
# -----------------------------
@app.post("/interest")
def set_interest(data: InterestRequest):
    userid = data.userid
    interested_fields = data.interested_fields

    if userid not in user_profiles:
        user_profiles[userid] = {}

    user_profiles[userid]["interested_fields"] = interested_fields
    print(f"User {userid} set interested fields to {interested_fields}")
    return {
        "message": "Interest saved",
        "userid": userid,
        "interested_fields": interested_fields
    }



# -----------------------------
# Optional: Get full profile
# -----------------------------
@app.get("/profile/{userid}")
def get_profile(userid: int):
    return user_profiles.get(userid, {})
