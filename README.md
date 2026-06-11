# Hall of Fame

A premium, highly interactive competitive Pokémon VGC team builder, match assistant, and journal. Design detailed Pokémon builds, analyze your offensive and defensive coverage, check speed tiers and Smogon usage stats during battles, and log match records with step-by-step turn resolution lists.

---

## Key Features

### 🏆 Hall of Fame & Team Hub

- **Roster & Builds Builder**: Configure detailed competitive builds (Natures, Hold Items, Abilities, SPs, Movesets, and Shiny/Tera configurations) powered by PokéAPI.
- **Usage Index**: Automatically tracks and ranks your most-used Pokémon species across all active teams by usage percentage in the main dashboard.

### 📊 Advanced Coverage Analysis (Team Journal)

- **Offensive Type Coverage**: Analyzes damaging moves across your team builds to map which types you hit for super-effective damage. Status moves (e.g. Will-O-Wisp) are automatically filtered out.
- **Defensive Type Profile**: Calculates the combined defensive rating (sum of multipliers) and identifies safe switch-ins (resistances or immunities) for all 18 types.
- **Vulnerability Recommendations**: Proactively flags caution/severe weaknesses and recommends specific typing additions to balance your team's defense.
- **Interactive Details Overlays**: Tapping any type tile in the coverage grids opens a glassmorphic **Overlay Bottom Modal** (aligns as an overlay bottom sheet drawer on mobile, and a centered card on desktop) showing coverage moves, safe switch-in multipliers, and a complete damage breakdown.

### ⚔️ Live Match Assistant

- **VGC Metagame Rulesets**: Toggle between rulesets to fetch official Smogon competitive metadata.
- **Real-Time Speed Queue**: Dynamically lists player vs opponent speed benchmarks, automatically calculating tailored active speeds based on modifiers:
  - Tailwind (2× speed)
  - Choice Scarf (1.5× speed)
  - Paralysis (0.5× speed)
  - Stat modifiers (from -6 to +6 stages)
- **Smogon Meta Profiles**: Fetches Smogon usage stats, common EV spreads, hold items, abilities, and popular movesets for opponents on the fly.
- **2v2 Type Matchup Matrix**: Compares your active field combatants against the opponent's active leads.

### 📝 Battle Record Logging

- **VGC Brought Parties (Limit 4)**: Configure brought parties for both sides with a limit of 4 Pokémon (standard VGC format brought size).
- **Interactive Turn Logs**:
  - Add individual turns and actions (Moves or Switches).
  - Select player moves dynamically from their build (Mega and custom forms handled case-insensitively).
  - Sort move execution speed order using inline sorting buttons (▲/▼).
- **Chronological Vertical Log**: Displays actions sequentially in a clean, vertical readable log (e.g., `1. Tinkaton [User] used Gigaton Hammer`), supporting quick toggles between "Edit Log" and "View Readable" states.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4
- **State / Persistence**: Zustand with `localStorage` persistence middleware
- **Routing**: React Router v7
- **APIs & Data Feeds**:
  - **PokéAPI**: Pokémon search, sprites, and base stats.
  - **Pokémon Showdown Dex**: Move categories (Physical/Special/Status), forms, and sprite matching.
  - **Smogon Stats API**: Real-time metagame usage details and sets.
- **Component Architecture**: Atomic design guidelines (`atoms` → `molecules` → `organisms` → `templates`).

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Installation & Run

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Start the local development server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173/` (or the specified port) in your browser.

4. Run a production build check:
   ```bash
   npm run build
   ```

---

## Project Structure

```
src/
├── assets/           # Type icons, Tera icons, branding logos
├── components/
│   ├── atoms/        # Base components (Button, TextInput, TextArea, TypeIcon, Loading, ...)
│   ├── molecules/    # Mid-level state blocks (BuildCard, StatsViewer, Modal, Tooltip, BattleRecordCard, ...)
│   ├── organisms/    # Global structures (Sidebar, TopNav, RosterSection, BuildManager, ...)
│   └── templates/    # AppLayout
├── hooks/            # Context & window resize hooks
├── pages/            # Core views (BuildsPage, TeamHubPage, JournalPage, MatchAssistantPage)
├── store/            # Global Zustand gameStore.ts
├── utils/            # Stat calculations, type charts, PokéAPI / Showdown data adapters
└── types.d.ts        # Shared TypeScript definitions
```

---

## Credits & Resources

- Type & Tera type icons by [jormxdos](https://www.deviantart.com/jormxdos).
- Species & Move data from [PokéAPI](https://pokeapi.co/) and [Pokémon Showdown](https://pokemonshowdown.com/).
- Meta profiles and usage statistics from [Smogon](https://www.smogon.com/).
