# 🏆 Hall of Fame

A premium, interactive portfolio component for showcasing your elite Pokémon team. Built with React, TypeScript, and Tailwind CSS, featuring real-time data persistence via Firebase and dynamic data fetching from PokéAPI.

![Hall of Fame Screenshot](public/logo.png)

## ✨ Features

- **Local Team Hub**: A stunning, glassmorphic display of your current "Hall of Fame" team.
- **Battle Build Library**: Create and save multiple competitive builds (EVs, IVs, Natures) for each team member.
- **Live Preview Editor**: Real-time sprite preview as you draft your team.
- **Rich Data**: Displays type, sprites, and base stats (HP, ATK, DEF, SPA, SPD, SPE).
- **Optimized Performance**: Uses **TanStack Query** for aggressive caching of API data.
- **Persistence**: **Zustand** + **Local Storage** ensures your team data is saved across sessions.
- **Responsive Design**: Fully responsive layout that looks great on mobile and desktop.
- **"Champion" Aesthetic**: Custom Gold & Royal Blue theme with high-quality animations.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) (w/ Vite), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with [Middleware/Persist](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **API**: [PokéAPI](https://pokeapi.co/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/hall-of-fame.git
    cd hall-of-fame
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```



4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```bash
src/
├── assets/         # Static assets (logos, images)
├── components/     # Reusable UI components (TeamCard, TeamGrid, etc.)
├── hooks/          # Custom Hooks (usePokemonData)
├── pages/          # Page views (Home, BuildManager)
├── store/          # Zustand store for team persistence
├── utils/          # Utility functions
└── main.tsx        # Application entry point
```



## 🙏 Credits

- Icons: [Pokemon Type Icons](https://github.com/partywhale/pokemon-type-icons/) by [partywhale](https://github.com/partywhale)

---

_Gotta catch 'em all!_ 🔴⚪
