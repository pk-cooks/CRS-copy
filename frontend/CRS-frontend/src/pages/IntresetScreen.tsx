import React, { useState } from "react";
import "../styles/Interest.css";

import { useNavigate } from "react-router-dom";



const interests = [
  "Web Development",
  "Data Science",
  "Machine Learning",
  "App Development",
  "Cloud Computing",
  "Cyber Security",
  "UI/UX Designing",
  "Digital Marketing",
  "Project Management",
];

const InterestScreen: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userid = 1;

  const toggleSelection = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userid,
          interested_fields: selected,
        }),
      });

      const data = await response.json();
      console.log("Saved interests:", data);

       navigate("/recommendations");

    } catch (error) {
      console.error("Error saving interests:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interest-wrapper">
      <div className="interest-card">

        <div className="logo">CRS</div>

        <h2 className="title">What are you Interested In ?</h2>
        <p className="subtitle">
          Select One or More Topics you'd Love to Learn.
        </p>

        <div className="grid">
          {interests.map((item) => (
            <button
              key={item}
              className={`option ${selected.includes(item) ? "selected" : ""}`}
              onClick={() => toggleSelection(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="actions">
          <button className="back">← Back</button>

          <button
            className="continue"
            disabled={selected.length === 0 || loading}
            onClick={handleContinue}
          >
            {loading ? "Saving..." : "Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default InterestScreen;
