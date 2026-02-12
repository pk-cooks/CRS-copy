import React, { useState } from "react";
import "../styles/EducationLevel.css";

import { useNavigate } from "react-router-dom";




type EducationLevel =
  | "High School"
  | "Undergraduate"
  | "Graduate"
  | "Professional";

const options: EducationLevel[] = [
  "High School",
  "Undergraduate",
  "Graduate",
  "Professional",
];

const EducationLevelScreen: React.FC = () => {
  const [selected, setSelected] = useState<EducationLevel | null>("High School");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userid = 1; // later replace with real auth user id

  const handleContinue = async () => {
    if (!selected) return;

    try {
      setLoading(true);
      

      const response = await fetch("http://localhost:8000/educationLevel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userid,
          education_level: selected,
        }),
      },

      
    
    );
    

      const data = await response.json();
      console.log("Saved:", data);
      navigate("/interest");

      // 👉 Navigate to next page here if needed
      // navigate("/interest");

    } catch (error) {
      console.error("Error saving education level:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="education-wrapper">
      <div className="education-card">

        <div className="logo">CRS</div>

        <h2 className="title">What’s your education level?</h2>
        <p className="subtitle">
          This helps us match courses to your background.
        </p>

        <div className="grid">
          {options.map((option) => (
            <button
              key={option}
              className={`option ${selected === option ? "selected" : ""}`}
              onClick={() => setSelected(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="actions">
          <button className="back">← Back</button>

          <button
            className="continue"
            disabled={!selected || loading}
            onClick={handleContinue}
          >
            {loading ? "Saving..." : "Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EducationLevelScreen;
