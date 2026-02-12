import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import EducationLevelScreen from "./pages/EducationLevel";
import InterestScreen from "./pages/IntresetScreen";
import Recommendations from "./pages/Recomendations";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/education" />} />

        <Route path="/education" element={<EducationLevelScreen />} />
        <Route path="/interest" element={<InterestScreen />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </Router>
  );
}

export default App;
