import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/templates/AppLayout";
import Home from "./pages/Home";
import BuildManager from "./pages/BuildManager";
import JournalPage from "./pages/JournalPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/builds/:id" element={<BuildManager />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route
            path="*"
            element={<div className="p-10 text-center text-white">404 Not Found</div>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
