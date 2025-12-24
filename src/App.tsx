import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BuildManager from "./pages/BuildManager";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builds/:id" element={<BuildManager />} />
          <Route
            path="*"
            element={<div className="p-10 text-center">404 Not Found</div>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
