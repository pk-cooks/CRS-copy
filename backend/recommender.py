import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

class CourseRecommender:
    def __init__(self, course_path, rating_path):
        self.courses = pd.read_csv(course_path)
        self.ratings = pd.read_csv(rating_path)
        self._prepare()

    def _prepare(self):
        self.user_item = self.ratings.pivot(
            index="userid",
            columns="courseid",
            values="rating"
        ).fillna(0)

        self.similarity = cosine_similarity(self.user_item)

    def recommend(self, userid, k=5):
        if userid not in self.user_item.index:
            return []

        user_index = self.user_item.index.tolist().index(userid)
        scores = self.similarity[user_index]

        similar_users = scores.argsort()[::-1][1:]
        weighted_scores = self.user_item.iloc[similar_users].mean()

        recommended = weighted_scores.sort_values(ascending=False)
        recommended = recommended[recommended > 0].head(k)

        return self.courses[
            self.courses.courseid.isin(recommended.index)
        ].to_dict(orient="records")
