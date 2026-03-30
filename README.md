# Hall of Fame

A competitive Pokémon VGC team management app. Track your builds, organize your teams, log strategic insights, and surface your most-used Pokémon across all your rosters.

## Features

- **Hall of Fame** — ranks your most-used Pokémon across all teams by usage percentage
- **Team Hub** — create and manage multiple teams, each with a roster of up to 6 Pokémon
- **Builds** — define detailed competitive builds (EVs, IVs, nature, item, moves) per Pokémon species, powered by PokéAPI
- **Journal** — per-team strategic log: record match leads, critical threats, and additional insights
- **Collapsible sidebar** on desktop, **dropdown top nav** on mobile

## Tech Stack

- **Framework**: React + TypeScript (Vite)
- **Styling**: Tailwind CSS v4
- **State / Persistence**: Zustand with localStorage middleware
- **Routing**: React Router v6
- **Species data**: PokéAPI (search + base stats)
- **Component architecture**: Atomic design (atoms → molecules → organisms → templates)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Requires Node.js v18+.

## Project Structure

```
src/
├── assets/           # Logo, type icons, tera type icons
├── components/
│   ├── atoms/        # Button, TextInput, TextArea, TypeIcon, Slider, Tag, Loading
│   ├── molecules/    # BuildCard, TeamCard, HallOfFamePokemonCard, StatsViewer, Modal, ...
│   ├── organisms/    # Sidebar, TopNav, BuildManager, RosterSection, SubsectionCard, SearchPokemon
│   └── templates/    # AppLayout
├── pages/            # Home, TeamHubPage, BuildsPage, JournalPage
├── store/            # Zustand game store
└── main.tsx
```

## Credits

- Type & Tera type icons by [jormxdos](https://www.deviantart.com/jormxdos)
- Sprite data from [PokéAPI](https://pokeapi.co/)
