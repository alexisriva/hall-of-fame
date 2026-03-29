import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/templates/AppLayout";
import Home from "./pages/Home";
import BuildManager from "./pages/BuildManager";
import JournalPage from "./pages/JournalPage";

// ── Mock data ─────────────────────────────────────────────────────────────────

const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const ROSTER: PokemonTeam = {
  id: "001",
  regulation: "Regulation H",
  name: "Vanguard Elite 01",
  pokemon: [
    {
      id: "006",
      name: "Charizard",
      species: {
        name: "Charizard",
        sprite: SPRITE(6),
        types: ["fire", "flying"],
      },
      isShiny: false,
      item: "Charcoal",
      ability: "Solar Power",
      nature: "Modest",
      moves: ["Heat Wave", "Air Slash", "Protect", "Solar Beam"],
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
      ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    },
    {
      id: "025",
      name: "Pikachu",
      species: {
        name: "Pikachu",
        sprite: SPRITE(25),
        types: ["electric"],
      },
      isShiny: false,
      item: "Light Ball",
      ability: "Lightning Rod",
      nature: "Timid",
      moves: ["Thunderbolt", "Fake Out", "Protect", "Volt Switch"],
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
      ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    },
    {
      id: "658",
      name: "Greninja",
      species: {
        name: "Greninja",
        sprite: SPRITE(658),
        types: ["water", "dark"],
      },
      isShiny: false,
      item: "Choice Specs",
      ability: "Protean",
      nature: "Timid",
      moves: ["Hydro Pump", "Dark Pulse", "Ice Beam", "U-turn"],
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
      ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    },
    {
      id: "448",
      name: "Lucario",
      species: {
        name: "Lucario",
        sprite: SPRITE(448),
        types: ["fighting", "steel"],
      },
      isShiny: false,
      item: "Choice Scarf",
      ability: "Inner Focus",
      nature: "Timid",
      moves: ["Close Combat", "Flash Cannon", "Extreme Speed", "Ice Punch"],
      evs: { hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 },
      ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    },
    {
      id: "468",
      name: "Togekiss",
      species: {
        name: "Togekiss",
        sprite: SPRITE(468),
        types: ["fairy", "flying"],
      },
      isShiny: false,
      item: "Sitrus Berry",
      ability: "Serene Grace",
      nature: "Calm",
      moves: ["Air Slash", "Dazzling Gleam", "Follow Me", "Protect"],
      evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
      ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    },
    {
      id: "445",
      name: "Garchomp",
      species: {
        name: "Garchomp",
        sprite: SPRITE(445),
        types: ["dragon", "ground"],
      },
      isShiny: false,
      item: "Life Orb",
      ability: "Rough Skin",
      nature: "Jolly",
      moves: ["Earthquake", "Dragon Claw", "Swords Dance", "Protect"],
      evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 0, spd: 31, spe: 31 },
    },
  ],
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
          <Route path="/builds/:id" element={<BuildManager />} />
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
