import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/templates/AppLayout";
import Home from "./pages/Home";
import BuildsPage from "./pages/BuildsPage";
import JournalPage from "./pages/JournalPage";

// ── Mock data ─────────────────────────────────────────────────────────────────
// PokemonTeam.pokemon is now string[] (build IDs stored in the gameStore).
// These placeholder IDs match the builds that would be in the store.

const ROSTER: PokemonTeam = {
  id: "001",
  regulation: "Regulation H",
  name: "Vanguard Elite 01",
  pokemon: ["006", "025", "658", "448", "445"],
  leads: [],
  counters: [],
  additionalInsights: "",
  wins: 0,
  losses: 0,
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/builds" element={<BuildsPage />} />
          <Route path="/journal" element={<JournalPage team={ROSTER} />} />
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
