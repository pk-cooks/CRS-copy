from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from recommender import CourseRecommender

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA = "data/"

courses = pd.read_csv(DATA + "course.csv")
ratings = pd.read_csv(DATA + "rating.csv")

recommender = CourseRecommender(
    DATA + "course.csv",
    DATA + "rating.csv"
)

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

@app.get("/recommend/{userid}")
def recommend(userid: int):
    return recommender.recommend(userid)
