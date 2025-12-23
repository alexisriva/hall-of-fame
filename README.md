# 🏆 Hall of Fame

A premium, interactive portfolio component for showcasing your elite Pokémon team. Built with React, TypeScript, and Tailwind CSS, featuring real-time data persistence via Firebase and dynamic data fetching from PokéAPI.

![Hall of Fame Screenshot](public/logo.png)

## ✨ Features

- **Public Showcase**: A stunning, glassmorphic display of your current "Hall of Fame" team.
- **Admin Dashboard**: A protected interface to manage your team roster.
- **Live Preview Editor**: Real-time sprite preview as you type Pokémon names.
- **Rich Data**: Displays type, sprites, and base stats (HP, ATK, DEF, SPA, SPD, SPE).
- **Optimized Performance**: Uses **TanStack Query** for aggressive caching of API data.
- **Real-time Sync**: **Firebase Firestore** integration ensures updates are pushed instantly to all viewers.
- **Responsive Design**: Fully responsive layout that looks great on mobile and desktop.
- **"Champion" Aesthetic**: Custom Gold & Royal Blue theme with high-quality animations.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) (w/ Vite), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend / Auth**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **API**: [PokéAPI](https://pokeapi.co/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Firebase project with **Firestore** and **Authentication** enabled.

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

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Firebase credentials:

    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```bash
src/
├── assets/         # Static assets (logos, images)
├── components/     # Reusable UI components
│   ├── admin/      # Admin-specific components (Editor, Dashboard Card)
│   └── ...         # Public components (TeamCard, TeamGrid)
├── contexts/       # React Contexts (AuthContext)
├── hooks/          # Custom Hooks (usePokemonData, usePokemonTeam)
├── pages/          # Page views (Home, Login, AdminDashboard)
├── utils/          # Utility functions
├── firebase.ts     # Firebase configuration
└── main.tsx        # Application entry point
```

## 🔐 Admin Access

To access the admin panel, navigate to `/admin`.
_Note: You must set up an authenticated user in your Firebase Console to log in._

---

_Gotta catch 'em all!_ 🔴⚪
