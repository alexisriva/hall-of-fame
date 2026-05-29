import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/templates/AppLayout";
import Home from "./pages/Home";
import BuildsPage from "./pages/BuildsPage";
import TeamHubPage from "./pages/TeamHubPage";
import JournalPage from "./pages/JournalPage";
import MatchAssistantPage from "./pages/MatchAssistantPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/team-hub" element={<TeamHubPage />} />
          <Route path="/team-hub/:id" element={<JournalPage />} />
          <Route path="/match-assistant" element={<MatchAssistantPage />} />
          <Route
            path="*"
            element={
              <div className="p-10 text-center text-white">404 Not Found</div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
