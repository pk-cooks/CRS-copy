import React, { useEffect, useState } from "react";
import "../styles/Recomendations.css"

interface Course {
  Title: string;
  URL: string;
  "Short Intro": string;
  "Sub-Category": string;
  "Course Type": string;
  Rating: number;
  Site: string;
}

const Recommendations: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("http://localhost:8000/recommend");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="recommendation-page">
      <div className="hero">
        <h1>✨ Your Recommendations</h1>
        <p>
          {loading
            ? "Finding courses for you..."
            : `We found ${courses.length} courses tailored to your profile`}
        </p>
      </div>

      <div className="cards-container">
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          courses.map((course, index) => (
            <div key={index} className="card">

              <div className="badge">TOP PICK</div>

              <h2>{course.Title}</h2>

              <div className="meta">
                <span>{course.Site}</span>
                <span className="level">
                  {course["Course Type"]}
                </span>
              </div>

              <p className="description">
                {course["Short Intro"]}
              </p>

              <div className="rating-view">
                <span className="rating">⭐ {course.Rating}</span>
                <a
                  href={course.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view"
                >
                  View ↗
                </a>
              </div>

              <hr />

              <p className="reason">
                Category: {course["Sub-Category"]}
              </p>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recommendations;
